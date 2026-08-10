// Must be imported before any other modules so Sentry can instrument them.
import { Sentry } from "./lib/sentry.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoute } from "./routes/health.js";
import { subscribeRoute } from "./routes/subscribe.js";
import { authRoute } from "./routes/auth.js";
import { questionsRoute } from "./routes/questions.js";
import { adminRoute } from "./routes/admin.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "https://echobyreaclyse.com",
      "https://www.echobyreaclyse.com",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:3000",
    ],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.route("/health", healthRoute);
app.route("/auth", authRoute);
app.route("/subscribe", subscribeRoute);
app.route("/questions", questionsRoute);
app.route("/admin", adminRoute);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  Sentry.captureException(err, {
    extra: {
      url: c.req.url,
      method: c.req.method,
    },
  });
  const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
  return c.json({ error: "Internal server error" }, status as 500);
});

export default app;
