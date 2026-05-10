import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("[resend] RESEND_API_KEY not set — email sending disabled");
}

export const resend = apiKey ? new Resend(apiKey) : null;
export const FROM_ADDRESS = "ÉCHO <hello@echobyreaclyse.com>";
export const WAITLIST_AUDIENCE_ID = process.env.RESEND_WAITLIST_AUDIENCE_ID ?? null;
export const APP_AUDIENCE_ID = process.env.RESEND_APP_AUDIENCE_ID ?? null;
