import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("[resend] RESEND_API_KEY not set — email sending will fail at call time");
}

export const resend = new Resend(apiKey ?? "missing");
export const FROM_ADDRESS = "ÉCHO <hello@echobyreaclyse.com>";
