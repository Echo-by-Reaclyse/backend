import { Hono } from "hono";
import { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { resend, FROM_ADDRESS } from "../lib/resend-client.js";
import { waitlistWelcomeEmail } from "../lib/email-templates.js";

const subscribe = new Hono();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  locale: z.string().nullable().optional(),
  source: z.string().default("landing"),
});

const withTimeout = <T>(p: PromiseLike<T>, ms: number): Promise<T> =>
  Promise.race([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);

subscribe.post("/", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0].message }, 400);
  }

  const { email, locale, source } = parsed.data;

  console.log("[subscribe] inserting:", email);
  let insertError: PostgrestError | null = null;
  try {
    const result = await withTimeout(
      supabaseAdmin.from("waitlist_signups").insert({ email, locale: locale ?? null, source }),
      8_000
    );
    insertError = result.error;
  } catch (err) {
    console.error("[subscribe] insert timeout/crash:", err instanceof Error ? err.message : err);
    return c.json({ error: "Service temporarily unavailable" }, 503);
  }

  // 23505 = unique_violation — already on the list, treat as success
  if (insertError && insertError.code !== "23505") {
    console.error("[subscribe] insert error:", insertError.code, insertError.message);
    return c.json({ error: "Failed to join waitlist" }, 500);
  }

  const alreadyExisted = insertError?.code === "23505";
  console.log("[subscribe] insert done, alreadyExisted:", alreadyExisted);

  if (!alreadyExisted) {
    let emailId: string | null = null;
    let emailFailed = false;
    try {
      const { data: emailData, error: emailError } = await withTimeout(
        resend.emails.send({
          from: FROM_ADDRESS,
          to: email,
          subject: "You're on the ÉCHO waitlist",
          html: waitlistWelcomeEmail(email),
        }),
        10_000
      );
      if (emailError) {
        emailFailed = true;
        console.error("[subscribe] email error:", emailError.message);
      } else {
        emailId = emailData?.id ?? null;
      }
    } catch (err) {
      emailFailed = true;
      console.error("[subscribe] email timeout:", err instanceof Error ? err.message : err);
    }

    // Log email (best-effort)
    supabaseAdmin
      .from("email_log")
      .insert({
        recipient_email: email,
        email_type: "waitlist_welcome",
        resend_message_id: emailId,
        status: emailFailed ? "failed" : "sent",
      })
      .then(undefined, console.error);
  }

  console.log("[subscribe] done");
  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
