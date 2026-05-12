/**
 * Usage:
 *   DATABASE_URL=<url> npx tsx scripts/set-admin.ts <email> <password>
 *
 * Finds the user by email, sets their password, and marks them as admin.
 * Also ensures an email identity row exists so sign-in works.
 */
import { sql } from "../src/lib/db.js";
import { hashPassword } from "../src/lib/password.js";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: tsx scripts/set-admin.ts <email> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const rows = await sql`SELECT id, email FROM users WHERE email = ${email}`;
if (rows.length === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

const user = rows[0] as { id: string; email: string };

const hash = await hashPassword(password);

await sql`
  UPDATE users
  SET password_hash = ${hash}, role = 'admin', updated_at = now()
  WHERE id = ${user.id}
`;

// Ensure an email identity exists so sign-in lookup works
await sql`
  INSERT INTO user_identities (user_id, provider, provider_id)
  VALUES (${user.id}, 'email', ${email})
  ON CONFLICT DO NOTHING
`;

console.log(`✓ ${email} is now an admin with a password set.`);
console.log(`  You can now log in at /admin/login with these credentials.`);
process.exit(0);
