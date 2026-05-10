import { Hono } from "hono";
import { z } from "zod";
import { resend, WAITLIST_AUDIENCE_ID } from "../lib/resend-client.js";

const subscribe = new Hono();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  consent: z.boolean({ required_error: "You must agree to receive updates" }),
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

  const { email, firstName, lastName, consent, hp } = parsed.data;

  if (!consent) return c.json({ error: "You must agree to receive updates" }, 400);

  // Honeypot — silently succeed so bots think they got through
  if (hp) return c.json({ success: true });

  if (!resend) {
    console.warn("[subscribe] Resend not configured — skipping");
    return c.json({ success: true });
  }

  if (WAITLIST_AUDIENCE_ID) {
    const contactResult = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId: WAITLIST_AUDIENCE_ID,
    });
    if (contactResult.error) {
      console.error("[subscribe] audience error:", contactResult.error);
    }
  } else {
    console.warn("[subscribe] RESEND_WAITLIST_AUDIENCE_ID not set — skipping audience registration");
  }

  const eventResult = await resend.events.send({
    event: "waitlist.joined",
    email,
  });
  if (eventResult.error) {
    console.error("[subscribe] event error:", eventResult.error);
  }

  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
