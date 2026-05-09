const SITE_URL = "https://echobyreaclyse.com";

function base(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0C0A08;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0EB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:32px;">
          <a href="${SITE_URL}" style="font-size:22px;font-weight:700;color:#F5F0EB;text-decoration:none;letter-spacing:0.05em;">ÉCHO</a>
        </td></tr>
        <tr><td style="background:#1A1612;border-radius:12px;padding:40px;">
          ${content}
        </td></tr>
        <tr><td style="padding-top:24px;font-size:12px;color:#6B6460;text-align:center;">
          © ${new Date().getFullYear()} Réaclyse · <a href="${SITE_URL}" style="color:#6B6460;">echobyreaclyse.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function waitlistWelcomeEmail(_email: string): string {
  return base(
    "You're on the ÉCHO waitlist",
    `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F5F0EB;">You're on the list.</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#C8BFB8;">We'll let you know when ÉCHO is ready for you. In the meantime, sit with a question.</p>
    <p style="margin:0;font-size:14px;color:#6B6460;">— The Réaclyse team</p>`
  );
}

export function appWelcomeEmail(_email: string): string {
  return base(
    "Welcome to ÉCHO",
    `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F5F0EB;">Welcome to ÉCHO.</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#C8BFB8;">Your first question is waiting. Open the app and speak — that's all there is to it.</p>
    <p style="margin:0;font-size:14px;color:#6B6460;">— The Réaclyse team</p>`
  );
}

export function accountDeletionEmail(_email: string): string {
  return base(
    "Your ÉCHO account has been deleted",
    `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F5F0EB;">Account deleted.</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#C8BFB8;">Your ÉCHO account and all associated data have been permanently removed.</p>
    <p style="margin:0;font-size:14px;color:#6B6460;">— The Réaclyse team</p>`
  );
}
