#!/usr/bin/env tsx
/**
 * Renders the email templates to `emails/*.html` for pasting into the Resend dashboard.
 *
 * The files are generated, not hand-edited — `src/lib/email-templates.ts` is the source of
 * truth. Re-run this after changing a template so the two cannot drift.
 *
 * The unsubscribe token `{{{RESEND_UNSUBSCRIBE_URL}}}` is left intact: Resend substitutes it
 * when the broadcast sends. Leave it in the HTML you paste.
 *
 *   npx tsx scripts/render-email.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { summitLaunchEmail } from "../src/lib/email-templates.js";

mkdirSync("emails", { recursive: true });

const files: Array<[string, string]> = [
  ["emails/summit-launch.html", summitLaunchEmail()],
];

for (const [path, html] of files) {
  writeFileSync(path, html);
  console.log(`  ✓ ${path}  (${html.length} bytes)`);
}
