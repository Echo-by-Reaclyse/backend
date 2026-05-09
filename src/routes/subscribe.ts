import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { resend, FROM_ADDRESS } from "../lib/resend-client.js";
import { waitlistWelcomeEmail } from "../lib/email-templates.js";

const subscribe = new Hono();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  locale: z.string().nullable().optional(),
  source: z.string().default("landing"),
});

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

  console.log("[subscribe] inserting email:", email);
  const { error: insertError } = await supabaseAdmin
    .from("waitlist_signups")
    .insert({ email, locale: locale ?? null, source });

  // 23505 = unique_violation — already on the list, treat as success
  if (insertError && insertError.code !== "23505") {
    console.error("[subscribe] insert error:", insertError.code, insertError.message);
    return c.json({ error: "Failed to join waitlist" }, 500);
  }

  const alreadyExisted = insertError?.code === "23505";
  console.log("[subscribe] insert done, alreadyExisted:", alreadyExisted);

  if (!alreadyExisted) {
    console.log("[subscribe] sending welcome email");
    let emailData: { id?: string } | null = null;
    let emailError: Error | null = null;
    try {
      const emailWithTimeout = Promise.race([
        resend.emails.send({
          from: FROM_ADDRESS,
          to: email,
          subject: "You're on the ÉCHO waitlist",
          html: waitlistWelcomeEmail(email),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Resend timeout")), 10_000)
        ),
      ]);
      const result = await emailWithTimeout;
      emailData = result.data;
      emailError = result.error ? new Error(result.error.message) : null;
    } catch (err) {
      emailError = err instanceof Error ? err : new Error(String(err));
      console.error("[subscribe] email error:", emailError.message);
    }

    // Log email (best-effort)
    supabaseAdmin
      .from("email_log")
      .insert({
        recipient_email: email,
        email_type: "waitlist_welcome",
        resend_message_id: emailData?.id ?? null,
        status: emailError ? "failed" : "sent",
      })
      .then(undefined, console.error);
  }

  console.log("[subscribe] done");
  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
