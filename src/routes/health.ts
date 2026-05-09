import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabase-admin.js";

const health = new Hono();

health.get("/", (c) =>
  c.json({ status: "ok", service: "echo-api", ts: Date.now() })
);

health.get("/db", async (c) => {
  const start = Date.now();
  try {
    const result = await Promise.race([
      supabaseAdmin.from("waitlist_signups").select("id").limit(1),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8_000)
      ),
    ]);
    const ms = Date.now() - start;
    if (result.error) {
      return c.json({ status: "error", message: result.error.message, code: result.error.code, ms }, 500);
    }
    return c.json({ status: "ok", ms });
  } catch (err) {
    const ms = Date.now() - start;
    return c.json({ status: "unreachable", message: err instanceof Error ? err.message : String(err), ms }, 503);
  }
});

export { health as healthRoute };
