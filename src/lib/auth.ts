import { createMiddleware } from "hono/factory";
import { supabaseAdmin } from "./supabase-admin";

type AuthVariables = {
  Variables: {
    auth: { userId: string; isServiceRole: boolean };
  };
};

export const authMiddleware = createMiddleware<AuthVariables>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice(7);

    if (token === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      c.set("auth", { userId: "service_role", isServiceRole: true });
      return next();
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("auth", { userId: user.id, isServiceRole: false });
    return next();
  }
);
