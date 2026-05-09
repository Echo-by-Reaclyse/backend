import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiresAt,
} from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { verifyAppleToken } from "../lib/apple-auth.js";
import { verifyGoogleToken } from "../lib/google-auth.js";
import { authMiddleware, type AuthVariables } from "../lib/auth.js";
import { resend, FROM_ADDRESS } from "../lib/resend-client.js";
import { appWelcomeEmail, accountDeletionEmail } from "../lib/email-templates.js";

const auth = new Hono<AuthVariables>();

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbUser {
  id: string;
  email: string | null;
  password_hash: string | null;
  display_name: string | null;
  photo_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function primaryProvider(userId: string): Promise<string> {
  const rows = await sql`
    SELECT provider FROM user_identities
    WHERE user_id = ${userId}
    ORDER BY created_at ASC LIMIT 1
  `;
  return (rows[0] as { provider: string } | undefined)?.provider ?? "email";
}

async function createSession(user: DbUser) {
  const provider = await primaryProvider(user.id);
  const refreshToken = generateRefreshToken();

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${hashToken(refreshToken)}, ${refreshExpiresAt()})
  `;

  const { token: accessToken, expiresAt } = await signAccessToken({
    sub: user.id,
    email: user.email,
    displayName: user.display_name,
    photoURL: user.photo_url,
    provider,
  });

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.display_name ?? null,
      photoURL: user.photo_url ?? null,
      provider,
    },
  };
}

async function findOrCreateOAuthUser(params: {
  provider: string;
  providerId: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<DbUser> {
  const { provider, providerId, email, displayName, photoURL } = params;

  // 1. Existing identity → return user, filling in any null profile fields
  const byIdentity = await sql`
    SELECT u.id, u.email, u.password_hash, u.display_name, u.photo_url
    FROM user_identities i
    JOIN users u ON u.id = i.user_id
    WHERE i.provider = ${provider} AND i.provider_id = ${providerId}
  `;
  if (byIdentity.length > 0) {
    const user = byIdentity[0] as DbUser;
    const needsUpdate =
      (!user.display_name && displayName) || (!user.photo_url && photoURL);
    if (needsUpdate) {
      const updated = await sql`
        UPDATE users SET
          display_name = COALESCE(display_name, ${displayName ?? null}),
          photo_url    = COALESCE(photo_url,    ${photoURL ?? null}),
          updated_at   = now()
        WHERE id = ${user.id}
        RETURNING id, email, password_hash, display_name, photo_url
      `;
      return updated[0] as DbUser;
    }
    return user;
  }

  // 2. Same email already exists → link identity to that account
  if (email) {
    const byEmail = await sql`
      SELECT id, email, password_hash, display_name, photo_url
      FROM users WHERE email = ${email}
    `;
    if (byEmail.length > 0) {
      const user = byEmail[0] as DbUser;
      await sql`
        INSERT INTO user_identities (user_id, provider, provider_id)
        VALUES (${user.id}, ${provider}, ${providerId})
        ON CONFLICT DO NOTHING
      `;
      return user;
    }
  }

  // 3. Create new user + identity
  const newUsers = await sql`
    INSERT INTO users (email, display_name, photo_url)
    VALUES (${email ?? null}, ${displayName ?? null}, ${photoURL ?? null})
    RETURNING id, email, password_hash, display_name, photo_url
  `;
  const user = newUsers[0] as DbUser;

  await sql`
    INSERT INTO user_identities (user_id, provider, provider_id)
    VALUES (${user.id}, ${provider}, ${providerId})
  `;

  return user;
}

// ─── Public: sign-up ─────────────────────────────────────────────────────────

auth.post("/sign-up", async (c) => {
  const body = z
    .object({ email: z.string().email(), password: z.string().min(8) })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { email, password } = body.data;

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) return c.json({ error: "Email already registered" }, 400);

  const users = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${await hashPassword(password)})
    RETURNING id, email, password_hash, display_name, photo_url
  `;
  const user = users[0] as DbUser;

  await sql`
    INSERT INTO user_identities (user_id, provider, provider_id)
    VALUES (${user.id}, 'email', ${email})
  `;

  const session = await createSession(user);

  if (resend) {
    resend.emails
      .send({ from: FROM_ADDRESS, to: email, subject: "Welcome to ÉCHO", html: appWelcomeEmail(email) })
      .catch((err: unknown) => console.error("[auth] welcome email error:", err instanceof Error ? err.message : err));
  }

  return c.json(session);
});

// ─── Public: sign-in (email/password) ────────────────────────────────────────

auth.post("/sign-in", async (c) => {
  const body = z
    .object({ email: z.string().email(), password: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { email, password } = body.data;
  const rows = await sql`
    SELECT id, email, password_hash, display_name, photo_url
    FROM users WHERE email = ${email}
  `;

  if (rows.length === 0) return c.json({ error: "Invalid email or password" }, 401);
  const user = rows[0] as DbUser;

  if (!user.password_hash)
    return c.json({ error: "This account uses social sign-in" }, 401);

  if (!(await verifyPassword(password, user.password_hash)))
    return c.json({ error: "Invalid email or password" }, 401);

  return c.json(await createSession(user));
});

// ─── Public: sign-in with Apple ──────────────────────────────────────────────

auth.post("/sign-in-apple", async (c) => {
  const body = z
    .object({ idToken: z.string(), nonce: z.string(), displayName: z.string().optional() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  try {
    const claims = await verifyAppleToken(body.data.idToken, body.data.nonce);
    const user = await findOrCreateOAuthUser({
      provider: "apple",
      providerId: claims.sub,
      email: claims.email,
      displayName: body.data.displayName ?? null,
    });
    return c.json(await createSession(user));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Apple sign-in failed";
    return c.json({ error: msg }, 401);
  }
});

// ─── Public: sign-in with Google ─────────────────────────────────────────────

auth.post("/sign-in-google", async (c) => {
  const body = z
    .object({ idToken: z.string(), accessToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  try {
    const claims = await verifyGoogleToken(body.data.idToken);
    const user = await findOrCreateOAuthUser({
      provider: "google",
      providerId: claims.sub,
      email: claims.email,
      displayName: claims.name,
      photoURL: claims.picture,
    });
    return c.json(await createSession(user));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Google sign-in failed";
    return c.json({ error: msg }, 401);
  }
});

// ─── Public: refresh ─────────────────────────────────────────────────────────

auth.post("/refresh", async (c) => {
  const body = z
    .object({ refreshToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const tokenHash = hashToken(body.data.refreshToken);
  const tokens = await sql`
    SELECT user_id FROM refresh_tokens
    WHERE token_hash = ${tokenHash} AND expires_at > now()
  `;
  if (tokens.length === 0) return c.json({ error: "Invalid or expired refresh token" }, 401);

  const userId = (tokens[0] as { user_id: string }).user_id;
  await sql`DELETE FROM refresh_tokens WHERE token_hash = ${tokenHash}`;

  const users = await sql`
    SELECT id, email, password_hash, display_name, photo_url FROM users WHERE id = ${userId}
  `;
  if (users.length === 0) return c.json({ error: "User not found" }, 401);

  return c.json(await createSession(users[0] as DbUser));
});

// ─── Authenticated: sign-out ──────────────────────────────────────────────────

auth.post("/sign-out", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  await sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}`.catch(console.error);
  return c.json({ success: true });
});

// ─── Authenticated: update display name ──────────────────────────────────────

auth.patch("/metadata", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const body = z
    .object({ displayName: z.string().trim().min(1) })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  await sql`
    UPDATE users SET display_name = ${body.data.displayName}, updated_at = now()
    WHERE id = ${userId}
  `;
  return c.json({ success: true });
});

// ─── Authenticated: delete account ───────────────────────────────────────────

auth.delete("/account", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const userRows = await sql`SELECT email FROM users WHERE id = ${userId}`;
  const email = (userRows[0] as { email: string | null } | undefined)?.email;

  await sql`DELETE FROM users WHERE id = ${userId}`;

  if (resend && email) {
    resend.emails
      .send({ from: FROM_ADDRESS, to: email, subject: "Your ÉCHO account has been deleted", html: accountDeletionEmail(email) })
      .catch((err: unknown) => console.error("[auth] deletion email error:", err instanceof Error ? err.message : err));
  }

  return c.json({ success: true });
});

// ─── Authenticated: list identities ──────────────────────────────────────────

auth.get("/identities", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const identities = await sql`
    SELECT id, provider, created_at FROM user_identities WHERE user_id = ${userId}
  `;
  return c.json({ identities });
});

// ─── Authenticated: link Apple ────────────────────────────────────────────────

auth.post("/link-apple", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const body = z
    .object({ idToken: z.string(), nonce: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  try {
    const claims = await verifyAppleToken(body.data.idToken, body.data.nonce);
    const existing = await sql`
      SELECT user_id FROM user_identities
      WHERE provider = 'apple' AND provider_id = ${claims.sub}
    `;
    if (existing.length > 0 && (existing[0] as { user_id: string }).user_id !== userId)
      return c.json({ error: "Apple account already linked to another user" }, 409);

    await sql`
      INSERT INTO user_identities (user_id, provider, provider_id)
      VALUES (${userId}, 'apple', ${claims.sub})
      ON CONFLICT DO NOTHING
    `;
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});

// ─── Authenticated: link Google ───────────────────────────────────────────────

auth.post("/link-google", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const body = z
    .object({ idToken: z.string(), accessToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  try {
    const claims = await verifyGoogleToken(body.data.idToken);
    const existing = await sql`
      SELECT user_id FROM user_identities
      WHERE provider = 'google' AND provider_id = ${claims.sub}
    `;
    if (existing.length > 0 && (existing[0] as { user_id: string }).user_id !== userId)
      return c.json({ error: "Google account already linked to another user" }, 409);

    await sql`
      INSERT INTO user_identities (user_id, provider, provider_id)
      VALUES (${userId}, 'google', ${claims.sub})
      ON CONFLICT DO NOTHING
    `;
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});

// ─── Authenticated: unlink identity ──────────────────────────────────────────

auth.delete("/identities/:id", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const identityId = c.req.param("id");

  const [countRows, userRows] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM user_identities WHERE user_id = ${userId}`,
    sql`SELECT password_hash FROM users WHERE id = ${userId}`,
  ]);
  const count = (countRows[0] as { count: number }).count;
  const hasPassword = !!(userRows[0] as { password_hash: string | null }).password_hash;

  if (count <= 1 && !hasPassword)
    return c.json({ error: "Cannot remove the last sign-in method" }, 400);

  await sql`DELETE FROM user_identities WHERE id = ${identityId} AND user_id = ${userId}`;
  return c.json({ success: true });
});

// ─── Authenticated: register device token ────────────────────────────────────

auth.post("/device-token", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const body = z
    .object({ token: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  await sql`
    INSERT INTO user_devices (user_id, device_token, platform)
    VALUES (${userId}, ${body.data.token}, 'ios')
    ON CONFLICT (device_token) DO UPDATE SET user_id = ${userId}
  `;
  return c.json({ success: true });
});

// ─── Authenticated: remove device token ──────────────────────────────────────

auth.delete("/device-token", authMiddleware, async (c) => {
  const { userId } = c.get("auth");
  const body = z
    .object({ token: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  await sql`
    DELETE FROM user_devices WHERE user_id = ${userId} AND device_token = ${body.data.token}
  `;
  return c.json({ success: true });
});

export { auth as authRoute };
