const WAITLIST_WEBHOOK = "https://hooks.slack.com/services/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";
const OAUTH_WEBHOOK = "https://hooks.slack.com/services/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";

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
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";
  const message = `🎉 New waitlist signup: ${email} (${name})`;
  await postToWebhook(WAITLIST_WEBHOOK, message);
}

export async function notifyOAuthSignup(
  email: string,
  provider: "apple" | "google",
  displayName?: string | null
): Promise<void> {
  const name = displayName || "Anonymous";
  const emoji = provider === "apple" ? "🍎" : "🔵";
  const message = `✨ New app signup via ${provider} — ${emoji} ${name} (${email})`;
  await postToWebhook(OAUTH_WEBHOOK, message);
}
