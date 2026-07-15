import { productConfig } from "@/config/product";

const wrapperStyle =
  "font-family: Arial, sans-serif; color: #24302f; line-height: 1.6; background: #f7faf8; padding: 24px;";
const cardStyle =
  "max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #dce7e4; border-radius: 8px; padding: 24px;";
const buttonStyle =
  "display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 16px; border-radius: 6px; font-weight: 700;";

function baseEmail({
  title,
  intro,
  buttonLabel,
  href,
  expiresText
}: {
  title: string;
  intro: string;
  buttonLabel: string;
  href: string;
  expiresText: string;
}) {
  return `
    <div style="${wrapperStyle}">
      <div style="${cardStyle}">
        <p style="font-size: 14px; color: #0f766e; font-weight: 700; margin: 0 0 12px;">${productConfig.name}</p>
        <h1 style="font-size: 24px; line-height: 1.25; margin: 0 0 16px;">${title}</h1>
        <p>${intro}</p>
        <p><a href="${href}" style="${buttonStyle}">${buttonLabel}</a></p>
        <p style="font-size: 14px; color: #5f6f6b;">${expiresText}</p>
        <p style="font-size: 14px; color: #5f6f6b;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="font-size: 14px; word-break: break-all;"><a href="${href}">${href}</a></p>
        <p style="font-size: 14px; color: #5f6f6b;">If you did not ask for this, you can ignore this email.</p>
      </div>
    </div>
  `;
}

export function verificationEmailHtml(href: string) {
  return baseEmail({
    title: "Confirm your email address",
    intro:
      "Please confirm your email address so we know where to send important account messages.",
    buttonLabel: "Confirm my email",
    href,
    expiresText: "This link works for 1 hour."
  });
}

export function passwordResetEmailHtml(href: string) {
  return baseEmail({
    title: "Reset your password",
    intro: "Use this link to choose a new password for your Business Sorted account.",
    buttonLabel: "Reset my password",
    href,
    expiresText: "This link works for 30 minutes and can only be used once."
  });
}

export function deadlineReminderEmailHtml({
  taskTitle,
  dueDate,
  nextAction,
  href
}: {
  taskTitle: string;
  dueDate: string;
  nextAction: string;
  href: string;
}) {
  return baseEmail({
    title: taskTitle,
    intro: `This Business Sorted reminder is about a deadline due ${dueDate}. Next step: ${nextAction}`,
    buttonLabel: "Open task",
    href,
    expiresText:
      "This is a deadline reminder, not accounting, tax or legal advice. Check the official source in the task if you are unsure."
  });
}
