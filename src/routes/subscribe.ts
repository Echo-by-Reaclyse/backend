import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
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

  try {
    await sql`
      INSERT INTO waitlist_signups (email, locale, source)
      VALUES (${email}, ${locale ?? null}, ${source})
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (err) {
    console.error("[subscribe] insert error:", err instanceof Error ? err.message : err);
    return c.json({ error: "Failed to join waitlist" }, 500);
  }

  if (resend) {
    resend.emails
      .send({
        from: FROM_ADDRESS,
        to: email,
        subject: "You're on the ÉCHO waitlist",
        html: waitlistWelcomeEmail(email),
      })
      .catch((err: unknown) =>
        console.error("[subscribe] email error:", err instanceof Error ? err.message : err)
      );
  }

  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
