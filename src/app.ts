import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoute } from "./routes/health.js";
import { subscribeRoute } from "./routes/subscribe.js";
import { sendEmailRoute } from "./routes/send-email.js";
import { authRoute } from "./routes/auth.js";

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
    ],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.route("/health", healthRoute);
app.route("/auth", authRoute);
app.route("/subscribe", subscribeRoute);
app.route("/send-email", sendEmailRoute);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
