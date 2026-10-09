/**
 * Migration: copy all waitlist contacts into the summit audience, then rename
 * summit → "newsletter". No new audience is created (stays within the 3-audience limit).
 *
 * Usage (from the backend/ directory):
 *   npx tsx scripts/migrate-to-newsletter.ts
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const candidates = [resolve(__dirname, "../.env"), resolve(process.cwd(), ".env")];
  for (const envPath of candidates) {
    try {
      const raw = readFileSync(envPath, "utf-8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
      return;
    } catch {
      // try next candidate
    }
  }
}

loadEnv();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const WAITLIST_ID = process.env.RESEND_WAITLIST_AUDIENCE_ID;
const SUMMIT_ID = process.env.RESEND_SUMMIT_AUDIENCE_ID;

if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
if (!WAITLIST_ID) throw new Error("RESEND_WAITLIST_AUDIENCE_ID not set");
if (!SUMMIT_ID) throw new Error("RESEND_SUMMIT_AUDIENCE_ID not set");

const resend = new Resend(RESEND_API_KEY);

type Contact = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  unsubscribed: boolean;
};

async function listContacts(audienceId: string): Promise<Contact[]> {
  const result = await resend.contacts.list({ audienceId });
  if (result.error) throw new Error(`Failed to list contacts: ${JSON.stringify(result.error)}`);
  return (result.data?.data ?? []) as Contact[];
}

async function main() {
  console.log("Fetching contacts from waitlist audience…");
  const waitlistContacts = await listContacts(WAITLIST_ID!);
  console.log(`  → ${waitlistContacts.length} contacts`);

  console.log("Fetching contacts from summit audience…");
  const summitContacts = await listContacts(SUMMIT_ID!);
  console.log(`  → ${summitContacts.length} contacts`);

  // Only add waitlist contacts not already in summit
  const summitEmails = new Set(summitContacts.map((c) => c.email.toLowerCase()));
  const toAdd = waitlistContacts.filter((c) => !summitEmails.has(c.email.toLowerCase()));
  console.log(`\nNew contacts to copy from waitlist → summit: ${toAdd.length}`);

  let added = 0;
  let skipped = 0;
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Process sequentially with a 120ms gap to stay under Resend's 10 req/s limit
  for (const c of toAdd) {
    const r = await resend.contacts.create({
      audienceId: SUMMIT_ID!,
      email: c.email,
      firstName: c.first_name,
      lastName: c.last_name,
      unsubscribed: c.unsubscribed,
    });
    if (r.error) {
      console.warn(`  ⚠ Failed to add ${c.email}: ${JSON.stringify(r.error)}`);
      skipped++;
      await delay(120);
      continue;
    }
    added++;
    await delay(120);

    // Remove from waitlist now that it's safely in newsletter
    const del = await resend.contacts.remove({ audienceId: WAITLIST_ID!, email: c.email });
    if (del.error) {
      console.warn(`  ⚠ Copied but failed to remove from waitlist: ${c.email}`);
    } else {
      console.log(`  moved: ${c.email}`);
    }
    await delay(120);
  }

  // Remove the contacts that were already in summit from the waitlist too
  const alreadyInSummit = waitlistContacts.filter((c) => summitEmails.has(c.email.toLowerCase()));
  if (alreadyInSummit.length > 0) {
    console.log(`\nRemoving ${alreadyInSummit.length} already-present contacts from waitlist…`);
    for (const c of alreadyInSummit) {
      const del = await resend.contacts.remove({ audienceId: WAITLIST_ID!, email: c.email });
      if (del.error) {
        console.warn(`  ⚠ Failed to remove ${c.email} from waitlist: ${JSON.stringify(del.error)}`);
      } else {
        console.log(`  removed from waitlist: ${c.email}`);
      }
      await delay(120);
    }
  }

  console.log('\n⚠  Resend SDK does not support renaming audiences via API.');
  console.log('   → Go to resend.com/audiences, open "summit", and rename it to "newsletter".');

  console.log("\n✅ Done.");
  console.log(`   Contacts added:               ${added}`);
  console.log(`   Skipped (errors):             ${skipped}`);
  console.log(`   Total in newsletter audience: ${summitContacts.length + added}`);
  console.log(`   Audience ID (unchanged):      ${SUMMIT_ID}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
