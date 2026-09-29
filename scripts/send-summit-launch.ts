#!/usr/bin/env tsx
/**
 * Summit launch announcement — creates a Resend broadcast to the summit audience.
 *
 * This script does NOT send anything. It creates the broadcast as a **draft**, so the
 * copy, the sender, the reply-to and the audience can all be checked in the Resend
 * dashboard before a human presses send. Sending a marketing email to real people is not
 * something to trigger from a terminal by accident.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/send-summit-launch.ts --preview
 *       Writes the rendered HTML to /tmp/summit-launch-preview.html and stops.
 *       Needs no credentials — open the file in a browser to read the email.
 *
 *   npx tsx --env-file=.env scripts/send-summit-launch.ts
 *       Creates the draft broadcast in Resend and prints its id and dashboard URL.
 *       Then: open it, preview it, send a test to yourself, and send from there.
 *
 * Requires RESEND_API_KEY and RESEND_SUMMIT_AUDIENCE_ID.
 */
import { writeFileSync } from "node:fs";
import { resend, FROM_ADDRESS, SUMMIT_AUDIENCE_ID } from "../src/lib/resend-client.js";
import { summitLaunchEmail } from "../src/lib/email-templates.js";

const PREVIEW_ONLY = process.argv.includes("--preview");
const PREVIEW_PATH = "/tmp/summit-launch-preview.html";

const SUBJECT = "As promised, you're first.";

/**
 * "Hit reply and tell me. I read every one." — so replies have to reach Roksana, not the
 * shared hello@ inbox the broadcast is sent from. Override with SUMMIT_REPLY_TO if her
 * address differs from the default below.
 */
const REPLY_TO = process.env.SUMMIT_REPLY_TO ?? "roksana@echobyreaclyse.com";

async function main(): Promise<void> {
  const html = summitLaunchEmail();

  if (PREVIEW_ONLY) {
    // The unsubscribe token is substituted by Resend at send time; swap in a placeholder
    // so the preview does not render a raw template variable.
    writeFileSync(PREVIEW_PATH, html.replace("{{{RESEND_UNSUBSCRIBE_URL}}}", "#preview-unsubscribe"));
    console.log(`[summit] preview written to ${PREVIEW_PATH}`);
    console.log(`[summit] subject : ${SUBJECT}`);
    console.log(`[summit] from    : ${FROM_ADDRESS}`);
    console.log(`[summit] reply-to: ${REPLY_TO}`);
    console.log("[summit] nothing sent, no credentials used.");
    return;
  }

  if (!resend) throw new Error("RESEND_API_KEY not set");
  if (!SUMMIT_AUDIENCE_ID) throw new Error("RESEND_SUMMIT_AUDIENCE_ID not set");

  const { data, error } = await resend.broadcasts.create({
    audienceId: SUMMIT_AUDIENCE_ID,
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    subject: SUBJECT,
    html,
  });

  if (error) throw new Error(`Resend rejected the broadcast: ${JSON.stringify(error)}`);

  console.log(`[summit] draft broadcast created: ${data?.id}`);
  console.log(`[summit] audience: ${SUMMIT_AUDIENCE_ID}`);
  console.log(`[summit] reply-to: ${REPLY_TO}`);
  console.log("[summit] NOT sent. Open it in Resend → Broadcasts, send yourself a test,");
  console.log("[summit] check the reply-to, then send from the dashboard.");
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("[summit] FAILED:", err);
    process.exit(1);
  });
