const SITE_URL = "https://echobyreaclyse.com";

function base(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f3ef;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f3ef;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

          <tr>
            <td style="background-color:#BF6040;padding:36px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:26px;font-weight:normal;letter-spacing:4px;text-transform:uppercase;">ÉCHO</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-family:Georgia,serif;font-size:13px;font-style:italic;letter-spacing:1px;">by Reaclyse</p>
            </td>
          </tr>

          <tr>
            <td style="padding:44px 40px 36px;">${content}</td>
          </tr>

          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f0ebe5;text-align:center;">
              <p style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#b8aea6;line-height:1.6;">
                © 2026 Reaclyse · <a href="${SITE_URL}" style="color:#BF6040;text-decoration:none;">echobyreaclyse.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function waitlistWelcomeEmail(_email: string): string {
  return base(
    "You're on the ÉCHO waitlist",
    `<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:normal;color:#1a1714;letter-spacing:0.5px;">You're on the list.</h1>
    <p style="margin:0 0 16px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      Thank you for your interest in ÉCHO. We're building a daily reflection app for private, evidence-based emotional tracking — and you'll be among the first to know when we open our doors.
    </p>
    <p style="margin:0 0 32px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      We'll send you one email when it's time. No newsletters, no drip sequences — just the launch note.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="background-color:#BF6040;border-radius:6px;">
          <a href="${SITE_URL}" style="display:inline-block;padding:13px 28px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Visit echobyreaclyse.com →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#b8aea6;line-height:1.6;">
      You're receiving this because you joined the ÉCHO waitlist. You won't hear from us again until launch.
    </p>`
  );
}

export function appWelcomeEmail(email: string): string {
  return base(
    "Welcome to ÉCHO",
    `<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:normal;color:#1a1714;letter-spacing:0.5px;">Welcome to ÉCHO.</h1>
    <p style="margin:0 0 16px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      Your account is ready. ÉCHO is a private space for daily reflection — one question a day, answered in your own voice, building a picture of who you are over time.
    </p>
    <p style="margin:0 0 32px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      Everything is stored on your device and synced privately via iCloud. Your reflections are yours alone. Open the app to record your first entry.
    </p>
    <p style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#b8aea6;line-height:1.6;">
      Signed up with: ${email}
    </p>`
  );
}

export function accountDeletionEmail(email: string): string {
  return base(
    "Your ÉCHO account has been deleted",
    `<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:normal;color:#1a1714;letter-spacing:0.5px;">Account deleted.</h1>
    <p style="margin:0 0 16px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      Your ÉCHO account associated with <strong>${email}</strong> has been permanently deleted. All account data has been removed from our servers.
    </p>
    <p style="margin:0 0 32px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#4a4540;line-height:1.7;">
      Journal entries stored in iCloud are managed by Apple and can be removed from your iCloud account settings if needed. If you believe this was a mistake, reply to this email.
    </p>
    <p style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#b8aea6;line-height:1.6;">
      This is an automated confirmation. No further action is required.
    </p>`
  );
}
