import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";

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

  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
