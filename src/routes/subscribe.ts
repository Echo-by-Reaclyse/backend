import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
import { resend, FROM_ADDRESS } from "../lib/resend-client.js";
import { waitlistWelcomeEmail } from "../lib/email-templates.js";

const subscribe = new Hono();

// ── Config ─────────────────────────────────────────────────────
const RATE_LIMIT_PER_HOUR = 5;   // max submissions per IP per 1-hour window
const RATE_LIMIT_CLEANUP_H = 24; // prune windows older than this

// ── Schema ─────────────────────────────────────────────────────
const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  locale: z.string().nullable().optional(),
  source: z.string().default("landing"),
  hp: z.string().default(""), // honeypot — must be empty
});

// ── Helpers ────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  // Vercel sets x-forwarded-for; first entry is the real client IP.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

async function checkRateLimit(ip: string): Promise<boolean> {
  // Returns true if the request is allowed (under limit), false if over.
  if (ip === "unknown") return true; // can't rate-limit without an IP

  try {
    // Prune stale windows to keep the table tidy.
    await sql`
      DELETE FROM subscribe_rate_limits
      WHERE window_start < now() - (${RATE_LIMIT_CLEANUP_H} || ' hours')::interval
    `;

    // Atomically upsert + increment the counter for the current hour window.
    const rows = await sql`
      INSERT INTO subscribe_rate_limits (ip, window_start, count)
      VALUES (${ip}, date_trunc('hour', now()), 1)
      ON CONFLICT (ip, window_start) DO UPDATE
        SET count = subscribe_rate_limits.count + 1
      RETURNING count
    `;

    const count = (rows[0] as { count: number }).count;
    return count <= RATE_LIMIT_PER_HOUR;
  } catch (err) {
    // If the table doesn't exist yet or the DB is unavailable, fail open
    // (allow the request) rather than blocking legitimate users.
    console.error("[subscribe] rate-limit check error:", err instanceof Error ? err.message : err);
    return true;
  }
}

// ── Handler ────────────────────────────────────────────────────

subscribe.post("/", async (c) => {
  // ── 1. User-agent gate — reject blank UAs (raw HTTP bots) ──
  const ua = c.req.header("user-agent") ?? "";
  if (!ua.trim()) {
    return c.json({ error: "Bad request" }, 400);
  }

  // ── 2. Parse body ──
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

  const { email, locale, source, hp } = parsed.data;

  // ── 3. Honeypot check — silently succeed so bots think they got through ──
  if (hp) {
    return c.json({ success: true });
  }

  // ── 4. IP rate limiting ──
  const ip = getClientIp(c.req.raw);
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }

  // ── 5. Insert (email deduplication already enforced by UNIQUE constraint) ──
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

  // ── 6. Welcome email (fire-and-forget) ──
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
