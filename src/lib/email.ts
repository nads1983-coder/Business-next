import { Resend } from "resend";
import { emailConfig } from "@/config/email";
import {
  deadlineReminderEmailHtml,
  documentRenewalReminderEmailHtml,
  passwordResetEmailHtml,
  verificationEmailHtml
} from "@/lib/email-html";

let resendClient: Resend | null = null;

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required before email can be sent.");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export function buildAppUrl(path: string, token: string) {
  const url = new URL(path, emailConfig.appUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export function appUrl(path: string) {
  return new URL(path, emailConfig.appUrl).toString();
}

async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey
}: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}) {
  if (!emailConfig.from) {
    throw new Error("EMAIL_FROM is required before email can be sent.");
  }

  const { error } = await getResend().emails.send(
    {
      from: emailConfig.from,
      to,
      subject,
      html
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

export async function sendDeadlineReminderEmail({
  email,
  taskTitle,
  businessName,
  dueDate,
  timeRemaining,
  nextAction,
  reason,
  preparationSteps,
  taskId,
  idempotencyKey
}: {
  email: string;
  taskTitle: string;
  businessName: string;
  dueDate: string;
  timeRemaining: string;
  nextAction: string;
  reason: string;
  preparationSteps: string[];
  taskId: string;
  idempotencyKey: string;
}) {
  const url = new URL(`/app/tasks/${taskId}`, emailConfig.appUrl);

  await sendEmail({
    to: email,
    subject: `Business Sorted reminder: ${taskTitle}`,
    html: deadlineReminderEmailHtml({
      taskTitle,
      businessName,
      dueDate,
      timeRemaining,
      nextAction,
      reason,
      preparationSteps,
      href: url.toString()
    }),
    idempotencyKey
  });
}

export async function sendDocumentRenewalReminderEmail({
  email,
  documentTitle,
  businessName,
  documentType,
  renewalDate,
  timeRemaining,
  reason,
  documentId,
  idempotencyKey
}: {
  email: string;
  documentTitle: string;
  businessName: string;
  documentType: string;
  renewalDate: string;
  timeRemaining: string;
  reason: string;
  documentId: string;
  idempotencyKey: string;
}) {
  const url = new URL("/app/documents", emailConfig.appUrl);
  url.searchParams.set("document", documentId);

  await sendEmail({
    to: email,
    subject: `Business Sorted document reminder: ${documentTitle}`,
    html: documentRenewalReminderEmailHtml({
      documentTitle,
      businessName,
      documentType,
      renewalDate,
      timeRemaining,
      reason,
      href: url.toString()
    }),
    idempotencyKey
  });
}

export async function sendVerificationEmail({
  email,
  token
}: {
  email: string;
  token: string;
}) {
  const href = buildAppUrl("/verify-email", token);

  await sendEmail({
    to: email,
    subject: emailConfig.subjects.verify,
    html: verificationEmailHtml(href),
    idempotencyKey: `verify-${token}`
  });
}

export async function sendPasswordResetEmail({
  email,
  token
}: {
  email: string;
  token: string;
}) {
  const href = buildAppUrl("/reset-password", token);

  await sendEmail({
    to: email,
    subject: emailConfig.subjects.reset,
    html: passwordResetEmailHtml(href),
    idempotencyKey: `reset-${token}`
  });
}
