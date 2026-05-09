import { Hono } from "hono";

const health = new Hono();

health.get("/", (c) =>
  c.json({ status: "ok", service: "echo-api", ts: Date.now() })
);

export { health as healthRoute };
