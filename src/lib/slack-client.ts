const WAITLIST_WEBHOOK = process.env.SLACK_WAITLIST_WEBHOOK;
const OAUTH_WEBHOOK = process.env.SLACK_OAUTH_WEBHOOK;

if (!WAITLIST_WEBHOOK) {
  console.warn("[slack] SLACK_WAITLIST_WEBHOOK not set — waitlist notifications disabled");
}

if (!OAUTH_WEBHOOK) {
  console.warn("[slack] SLACK_OAUTH_WEBHOOK not set — OAuth notifications disabled");
}

async function postToWebhook(webhookUrl: string, message: string): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      console.error("[slack] webhook failed:", response.status, response.statusText);
    }
  } catch (err) {
    console.error(
      "[slack] webhook error:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function notifyWaitlistSignup(
  email: string,
  firstName?: string | null,
  lastName?: string | null
): Promise<void> {
  if (!WAITLIST_WEBHOOK) return;

  const name = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";
  const message = `🎉 New waitlist signup: ${email} (${name})`;
  await postToWebhook(WAITLIST_WEBHOOK, message);
}

export async function notifyOAuthSignup(
  email: string,
  provider: "apple" | "google",
  displayName?: string | null
): Promise<void> {
  if (!OAUTH_WEBHOOK) return;

  const name = displayName || "Anonymous";
  const emoji = provider === "apple" ? "🍎" : "🔵";
  const message = `✨ New app signup via ${provider} — ${emoji} ${name} (${email})`;
  await postToWebhook(OAUTH_WEBHOOK, message);
}

export async function notifyEmailSignup(email: string): Promise<void> {
  if (!OAUTH_WEBHOOK) return;
  await postToWebhook(OAUTH_WEBHOOK, `✉️ New app signup via email — ${email}`);
}
