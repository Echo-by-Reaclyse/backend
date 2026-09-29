const SITE_URL = "https://echobyreaclyse.com";

/** The App Store listing. Unaccented id form on purpose: the canonical URL carries "écho"
 *  and "réaclyse", and email clients are far less forgiving of non-ASCII in hrefs than a
 *  browser is. This form also leaves the storefront to the reader's own account rather than
 *  pinning them to /us/, which matters for a mostly-European list. */
const APP_STORE_URL = "https://apps.apple.com/app/id6806377088";

interface BaseOptions {
  /** Inbox preview line, after the subject. Hidden in the body itself. */
  preheader?: string;
  /** Broadcasts must carry an unsubscribe link; Resend substitutes the token. */
  unsubscribe?: boolean;
}

function base(title: string, content: string, opts: BaseOptions = {}): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>`
    : "";
  const unsubscribe = opts.unsubscribe
    ? `<br /><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#6B6460;">Unsubscribe</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0C0A08;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0EB;">
  ${preheader}
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
          © ${new Date().getFullYear()} Réaclyse · <a href="${SITE_URL}" style="color:#6B6460;">echobyreaclyse.com</a>${unsubscribe}
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

/**
 * Summit launch announcement — the list that met Roksana at Girls Future Ready.
 *
 * Signed by her, not the team, and written to be replied to: send this with a `replyTo`
 * that reaches her, or "hit reply and tell me" is a lie.
 */
export function summitLaunchEmail(): string {
  return base(
    "As promised, you're first",
    `<h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#F5F0EB;line-height:1.3;">As promised, you're first.</h1>

    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#C8BFB8;">ÉCHO is live, and you're hearing it from me before I tell anyone else.</p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:#BF6040;border-radius:999px;">
        <a href="${APP_STORE_URL}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FFF6E9;text-decoration:none;letter-spacing:0.01em;">Download ÉCHO</a>
      </td></tr>
    </table>

    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#C8BFB8;">For your first entry, go back to the question from my last email: what did you hear at the summit that you don't want to forget?</p>

    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#C8BFB8;">Open ÉCHO, press record, and say it out loud. Ten seconds is enough. It will feel small today. Months from now, it will be how you remember who you were in that room.</p>

    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#C8BFB8;">ÉCHO is free to start. The more you record, the more of your own voice it has to bring back to you.</p>

    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#C8BFB8;">I'd love to hear what you think. Hit reply and tell me. I read every one.</p>

    <p style="margin:0;font-size:16px;line-height:1.6;color:#F5F0EB;">Roksana</p>`,
    {
      preheader: "ÉCHO is live. Your first entry takes ten seconds.",
      unsubscribe: true,
    }
  );
}
