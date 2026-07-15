import { Resend } from "resend";
import { emailConfig } from "@/config/email";
import { deadlineReminderEmailHtml, passwordResetEmailHtml, verificationEmailHtml } from "@/lib/email-html";

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
  dueDate,
  nextAction,
  taskId,
  interval
}: {
  email: string;
  taskTitle: string;
  dueDate: string;
  nextAction: string;
  taskId: string;
  interval: string;
}) {
  const url = new URL(`/app/tasks/${taskId}`, emailConfig.appUrl);

  await sendEmail({
    to: email,
    subject: `Business Sorted reminder: ${taskTitle}`,
    html: deadlineReminderEmailHtml({
      taskTitle,
      dueDate,
      nextAction,
      href: url.toString()
    }),
    idempotencyKey: `deadline-${taskId}-${interval}`
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
