import { Hono } from "hono";
import { z } from "zod";
import type { User, Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { supabaseClient, userScopedClient } from "../lib/supabase-client.js";
import { authMiddleware } from "../lib/auth.js";

// ─── Response helpers ─────────────────────────────────────────────────────────

function sessionPayload(session: Session) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: userPayload(session.user),
  };
}

function userPayload(user: User) {
  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : "email";

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  const photoURL =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName,
    photoURL,
    provider,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

type AuthVariables = {
  Variables: { auth: { userId: string; isServiceRole: boolean } };
};

const auth = new Hono<AuthVariables>();

// ── Public: sign-up ──────────────────────────────────────────────────────────

auth.post("/sign-up", async (c) => {
  const body = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await supabaseClient.auth.signUp({
    email: body.data.email,
    password: body.data.password,
  });

  if (error) return c.json({ error: error.message }, 400);

  // Email confirmation required — no session yet
  if (!data.session) {
    return c.json({ requiresEmailConfirmation: true });
  }

  return c.json(sessionPayload(data.session));
});

// ── Public: sign-in (email/password) ─────────────────────────────────────────

auth.post("/sign-in", async (c) => {
  const body = z
    .object({ email: z.string().email(), password: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });

  if (error || !data.session) return c.json({ error: error?.message ?? "Sign-in failed" }, 401);
  return c.json(sessionPayload(data.session));
});

// ── Public: sign-in with Apple ────────────────────────────────────────────────

auth.post("/sign-in-apple", async (c) => {
  const body = z
    .object({ idToken: z.string(), nonce: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await supabaseClient.auth.signInWithIdToken({
    provider: "apple",
    token: body.data.idToken,
    nonce: body.data.nonce,
  });

  if (error || !data.session) return c.json({ error: error?.message ?? "Sign-in failed" }, 401);
  return c.json(sessionPayload(data.session));
});

// ── Public: sign-in with Google ───────────────────────────────────────────────

auth.post("/sign-in-google", async (c) => {
  const body = z
    .object({ idToken: z.string(), accessToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await supabaseClient.auth.signInWithIdToken({
    provider: "google",
    token: body.data.idToken,
    access_token: body.data.accessToken,
  });

  if (error || !data.session) return c.json({ error: error?.message ?? "Sign-in failed" }, 401);
  return c.json(sessionPayload(data.session));
});

// ── Public: refresh token ─────────────────────────────────────────────────────

auth.post("/refresh", async (c) => {
  const body = z
    .object({ refreshToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await supabaseClient.auth.refreshSession({
    refresh_token: body.data.refreshToken,
  });

  if (error || !data.session) return c.json({ error: error?.message ?? "Refresh failed" }, 401);
  return c.json(sessionPayload(data.session));
});

// ── Authenticated: sign-out ───────────────────────────────────────────────────

auth.post("/sign-out", authMiddleware, async (c) => {
  const rawToken = c.req.header("Authorization")!.slice(7);
  // Revoke the session globally so all devices are signed out
  await supabaseAdmin.auth.admin.signOut(rawToken, "global").catch(console.error);
  return c.json({ success: true });
});

// ── Authenticated: update display name ───────────────────────────────────────

auth.patch("/metadata", authMiddleware, async (c) => {
  const auth = c.get("auth");
  const body = z
    .object({ displayName: z.string().trim().min(1) })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { error } = await supabaseAdmin.auth.admin.updateUserById(auth.userId, {
    user_metadata: { full_name: body.data.displayName },
  });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ── Authenticated: delete account ─────────────────────────────────────────────

auth.delete("/account", authMiddleware, async (c) => {
  const auth = c.get("auth");

  const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(auth.userId);
  if (fetchError || !user) return c.json({ error: "User not found" }, 404);

  const email = user.email;

  const { error } = await supabaseAdmin.auth.admin.deleteUser(auth.userId);
  if (error) return c.json({ error: error.message }, 500);

  return c.json({ success: true });
});

// ── Authenticated: list identities ────────────────────────────────────────────

auth.get("/identities", authMiddleware, async (c) => {
  const auth = c.get("auth");

  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(auth.userId);
  if (error || !user) return c.json({ error: "User not found" }, 404);

  const identities = (user.identities ?? []).map((identity) => ({
    id: identity.id,
    provider: identity.provider,
    createdAt: identity.created_at,
  }));

  return c.json({ identities });
});

// ── Authenticated: link Apple identity ───────────────────────────────────────

auth.post("/link-apple", authMiddleware, async (c) => {
  const rawToken = c.req.header("Authorization")!.slice(7);
  const body = z
    .object({ idToken: z.string(), nonce: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  // Use a user-scoped client so Supabase links rather than creates a new account
  const { data, error } = await userScopedClient(rawToken).auth.signInWithIdToken({
    provider: "apple",
    token: body.data.idToken,
    nonce: body.data.nonce,
  });

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data.session ? sessionPayload(data.session) : { success: true });
});

// ── Authenticated: link Google identity ──────────────────────────────────────

auth.post("/link-google", authMiddleware, async (c) => {
  const rawToken = c.req.header("Authorization")!.slice(7);
  const body = z
    .object({ idToken: z.string(), accessToken: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { data, error } = await userScopedClient(rawToken).auth.signInWithIdToken({
    provider: "google",
    token: body.data.idToken,
    access_token: body.data.accessToken,
  });

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data.session ? sessionPayload(data.session) : { success: true });
});

// ── Authenticated: unlink identity ───────────────────────────────────────────

auth.delete("/identities/:id", authMiddleware, async (c) => {
  const auth = c.get("auth");
  const identityId = c.req.param("id");

  // Verify user has more than one identity before unlinking
  const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(auth.userId);
  if (fetchError || !user) return c.json({ error: "User not found" }, 404);
  if ((user.identities ?? []).length <= 1) {
    return c.json({ error: "Cannot remove the last sign-in method" }, 400);
  }

  // Supabase GoTrue admin REST API for identity deletion.
  // New opaque secret keys are not JWTs — only send via apikey header, not Authorization.
  const res = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/admin/users/${auth.userId}/identities/${identityId}`,
    {
      method: "DELETE",
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY!,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    return c.json({ error: err.message ?? "Unlink failed" }, 400);
  }

  return c.json({ success: true });
});

// ── Authenticated: register push device token ─────────────────────────────────

auth.post("/device-token", authMiddleware, async (c) => {
  const auth = c.get("auth");
  const body = z
    .object({ token: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { error } = await supabaseAdmin
    .from("user_devices")
    .upsert(
      {
        user_id: auth.userId,
        device_token: body.data.token,
        platform: "ios",
      },
      { onConflict: "device_token" }
    );

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ── Authenticated: remove push device token ───────────────────────────────────

auth.delete("/device-token", authMiddleware, async (c) => {
  const body = z
    .object({ token: z.string() })
    .safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0].message }, 400);

  const { error } = await supabaseAdmin
    .from("user_devices")
    .delete()
    .eq("device_token", body.data.token);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export { auth as authRoute };
