import { Hono } from "hono";
import { sql } from "../lib/db.js";

const health = new Hono();

health.get("/", (c) =>
  c.json({ status: "ok", service: "echo-api", ts: Date.now() })
);

health.get("/db", async (c) => {
  const start = Date.now();
  try {
    await sql`SELECT 1`;
    return c.json({ status: "ok", ms: Date.now() - start });
  } catch (err) {
    return c.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : String(err),
        ms: Date.now() - start,
      },
      503
    );
  }
});

export { health as healthRoute };
