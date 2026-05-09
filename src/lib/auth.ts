import { createMiddleware } from "hono/factory";
import { verifyAccessToken } from "./jwt.js";

export type AuthVariables = {
  Variables: { auth: { userId: string } };
};

export const authMiddleware = createMiddleware<AuthVariables>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const payload = await verifyAccessToken(header.slice(7));
    c.set("auth", { userId: payload.sub! });
    return next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
