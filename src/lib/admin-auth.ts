import { createMiddleware } from "hono/factory";
import { verifyAccessToken } from "./jwt.js";

export type AdminVariables = {
  Variables: { auth: { userId: string; role: string } };
};

export const adminMiddleware = createMiddleware<AdminVariables>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const payload = await verifyAccessToken(header.slice(7));
    if (payload.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }
    c.set("auth", { userId: payload.sub!, role: payload.role });
    return next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
