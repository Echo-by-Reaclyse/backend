import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-admin.js";

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
  let insertError: { code: string; message: string } | null = null;
  try {
    const result = await withTimeout(
      supabaseAdmin.from("waitlist_signups").insert({ email, locale: locale ?? null, source }),
      8_000
    );
    insertError = result.error as typeof insertError;
  } catch (err) {
    console.error("[subscribe] insert timeout/crash:", err instanceof Error ? err.message : err);
    return c.json({ error: "Service temporarily unavailable" }, 503);
  }

  // 23505 = unique_violation — already on the list, treat as success
  if (insertError && insertError.code !== "23505") {
    console.error("[subscribe] insert error:", insertError.code, insertError.message);
    return c.json({ error: "Failed to join waitlist" }, 500);
  }

  console.log("[subscribe] done, alreadyExisted:", insertError?.code === "23505");
  return c.json({ success: true });
});

export { subscribe as subscribeRoute };
