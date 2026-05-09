import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-admin";
import { resend, FROM_ADDRESS } from "../lib/resend-client";
import {
  appWelcomeEmail,
  accountDeletionEmail,
} from "../lib/email-templates";
import { authMiddleware } from "../lib/auth";

const EMAIL_TYPES = ["app_welcome", "account_deletion"] as const;
type EmailType = (typeof EMAIL_TYPES)[number];

const SUBJECTS: Record<EmailType, string> = {
  app_welcome: "Welcome to ÉCHO",
  account_deletion: "Your ÉCHO account has been deleted",
};

function renderTemplate(type: EmailType, email: string): string {
  switch (type) {
    case "app_welcome":
      return appWelcomeEmail(email);
    case "account_deletion":
      return accountDeletionEmail(email);
  }
}

const bodySchema = z.object({
  type: z.enum(EMAIL_TYPES),
  recipientEmail: z.string().email("Invalid recipient email"),
});

const sendEmail = new Hono<{
  Variables: { auth: { userId: string; isServiceRole: boolean } };
}>();

sendEmail.use("*", authMiddleware);

sendEmail.post("/", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0].message }, 400);
  }

  const { type, recipientEmail } = parsed.data;
  const auth = c.get("auth");

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: recipientEmail,
    subject: SUBJECTS[type],
    html: renderTemplate(type, recipientEmail),
  });

  supabaseAdmin
    .from("email_log")
    .insert({
      recipient_email: recipientEmail,
      email_type: type,
      resend_message_id: emailData?.id ?? null,
      status: emailError ? "failed" : "sent",
      user_id: auth.isServiceRole ? null : auth.userId,
    })
    .then(undefined, console.error);

  if (emailError) {
    console.error("[send-email] resend error:", emailError.message);
    return c.json({ error: "Failed to send email" }, 500);
  }

  return c.json({ success: true, messageId: emailData?.id });
});

export { sendEmail as sendEmailRoute };
