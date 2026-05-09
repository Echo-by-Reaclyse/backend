import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
}

// Publishable-key client for user-facing auth operations (sign-in, sign-up, refresh).
// Does NOT bypass RLS — use supabaseAdmin for privileged operations.
export const supabaseClient = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Creates a one-off client scoped to a specific user's JWT.
// Used for operations that require the user's active session context
// (e.g. identity linking via id_token).
export function userScopedClient(accessToken: string) {
  return createClient(url!, publishableKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
