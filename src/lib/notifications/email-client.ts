import { emailConfig } from "@/config/email";
import type { Resend } from "resend";

export type OperationalEmailPayload = {
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  replyTo?: string;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function safeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

let resendClient: Resend | null = null;

async function getOperationalResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required before operational notifications can be sent.");
  }

  if (!resendClient) {
    const { Resend } = await import("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export async function sendOperationalNotificationEmail({
  subject,
  html,
  text,
  idempotencyKey,
  replyTo
}: OperationalEmailPayload) {
  if (!emailConfig.notificationEmail) {
    throw new Error("NOTIFICATION_EMAIL is required before operational notifications can be sent.");
  }

  if (!emailConfig.from) {
    throw new Error("EMAIL_FROM is required before operational notifications can be sent.");
  }

  const { error } = await (await getOperationalResend()).emails.send(
    {
      from: emailConfig.from,
      to: emailConfig.notificationEmail,
      replyTo: replyTo ?? emailConfig.replyTo,
      subject,
      html,
      text
    },
    {
      headers: {
        "Idempotency-Key": idempotencyKey
      }
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function logNotificationFailure({
  eventType,
  recordId,
  error
}: {
  eventType: "signup" | "enquiry";
  recordId: string;
  error: unknown;
}) {
  console.error("Operational notification failed", {
    eventType,
    recordId,
    message: error instanceof Error ? error.message : "Unknown notification error"
  });
}
