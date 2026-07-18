import { productConfig } from "@/config/product";

const wrapperStyle =
  "font-family: Arial, sans-serif; color: #24302f; line-height: 1.6; background: #f7faf8; padding: 24px;";
const cardStyle =
  "max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #dce7e4; border-radius: 8px; padding: 24px;";
const buttonStyle =
  "display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 16px; border-radius: 6px; font-weight: 700;";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
  businessName,
  dueDate,
  timeRemaining,
  nextAction,
  reason,
  preparationSteps,
  href
}: {
  taskTitle: string;
  businessName: string;
  dueDate: string;
  timeRemaining: string;
  nextAction: string;
  reason: string;
  preparationSteps: string[];
  href: string;
}) {
  const preparation = preparationSteps.length
    ? `<ul>${preparationSteps.slice(0, 5).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>`
    : "<p>No extra preparation steps are listed for this task yet.</p>";

  return baseEmail({
    title: escapeHtml(taskTitle),
    intro: `
      This Business Sorted reminder is for ${escapeHtml(businessName)}. The verified deadline is ${escapeHtml(dueDate)}, which is ${escapeHtml(timeRemaining)}.
      <br /><br />
      You are receiving this because ${escapeHtml(reason)}.
      <br /><br />
      Next step: ${escapeHtml(nextAction)}
      <br /><br />
      Preparation steps:
      ${preparation}
    `,
    buttonLabel: "Open task",
    href,
    expiresText:
      "Business Sorted provides general compliance-support information only. It is not legal, tax, accounting or financial advice, and Business Sorted has not filed anything on your behalf."
  });
}

export function documentRenewalReminderEmailHtml({
  documentTitle,
  businessName,
  documentType,
  renewalDate,
  timeRemaining,
  reason,
  href
}: {
  documentTitle: string;
  businessName: string;
  documentType: string;
  renewalDate: string;
  timeRemaining: string;
  reason: string;
  href: string;
}) {
  return baseEmail({
    title: escapeHtml(documentTitle),
    intro: `
      This Business Sorted reminder is for ${escapeHtml(businessName)}. The ${escapeHtml(documentType)} renewal date is ${escapeHtml(renewalDate)}, which ${escapeHtml(timeRemaining)}.
      <br /><br />
      You are receiving this because ${escapeHtml(reason)}.
      <br /><br />
      Open the document record to update the date, mark it renewed, archive it, or change future reminder settings.
    `,
    buttonLabel: "Open document",
    href,
    expiresText:
      "Business Sorted provides general compliance-support information only. It is not legal, tax, accounting or financial advice, and Business Sorted has not renewed, filed or submitted anything on your behalf."
  });
}
