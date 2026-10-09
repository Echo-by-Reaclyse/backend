import { Hono } from "hono";
import { z } from "zod";
import { resend, NEWSLETTER_AUDIENCE_ID } from "../lib/resend-client.js";
import { notifyNewsletterSignup } from "../lib/slack-client.js";

const subscribe = new Hono();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  hp: z.string().default(""), // honeypot — must be empty
});

subscribe.post("/", async (c) => {
  // Reject blank user-agents (raw HTTP bots)
  const ua = c.req.header("user-agent") ?? "";
  if (!ua.trim()) return c.json({ error: "Bad request" }, 400);

  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: "Invalid JSON body" }, 400); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues[0].message }, 400);

  const { email, firstName, lastName, hp } = parsed.data;

  // Honeypot — silently succeed so bots think they got through
  if (hp) return c.json({ success: true });

  if (!resend) {
    console.warn("[subscribe] Resend not configured — skipping");
    return c.json({ success: true });
  }

  if (NEWSLETTER_AUDIENCE_ID) {
    const result = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId: NEWSLETTER_AUDIENCE_ID,
    });
    if (result.error) {
      console.error("[subscribe] audience error:", result.error);
    }
  } else {
    console.warn("[subscribe] RESEND_NEWSLETTER_AUDIENCE_ID not set — skipping audience registration");
  }

  await notifyNewsletterSignup(email).catch(console.error);

  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
