import { Hono } from "hono";
import { z } from "zod";
import { resend, WAITLIST_AUDIENCE_ID, SUMMIT_AUDIENCE_ID } from "../lib/resend-client.js";
import { notifyWaitlistSignup } from "../lib/slack-client.js";

const subscribe = new Hono();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  consent: z.boolean({ required_error: "You must agree to receive updates" }),
  hp: z.string().default(""), // honeypot — must be empty
  source: z.enum(["landing", "summit"]).default("landing"),
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

  const { email, firstName, lastName, consent, hp, source } = parsed.data;

  if (!consent) return c.json({ error: "You must agree to receive updates" }, 400);

  // Honeypot — silently succeed so bots think they got through
  if (hp) return c.json({ success: true });

  if (!resend) {
    console.warn("[subscribe] Resend not configured — skipping");
    return c.json({ success: true });
  }

  const isSummit = source === "summit";
  const audienceId = isSummit ? SUMMIT_AUDIENCE_ID : WAITLIST_AUDIENCE_ID;
  const eventName = isSummit ? "summit.joined" : "waitlist.joined";

  if (audienceId) {
    const contactResult = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId,
    });
    if (contactResult.error) {
      console.error(`[subscribe] audience error (${source}):`, contactResult.error);
    }
  } else {
    console.warn(`[subscribe] audience ID not set for source="${source}" — skipping audience registration`);
  }

  const eventResult = await resend.events.send({
    event: eventName,
    email,
  });
  if (eventResult.error) {
    console.error(`[subscribe] event error (${eventName}):`, eventResult.error);
  }

  await notifyWaitlistSignup(email, firstName, lastName, source).catch(console.error);

  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
