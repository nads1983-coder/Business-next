import { productConfig } from "@/config/product";
import { billingConfig } from "@/config/billing";

const configuredAppUrl =
  process.env.BUSINESS_NEXT_APPROVED_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL;

export const emailConfig = {
  from: process.env.EMAIL_FROM ?? "",
  replyTo: process.env.EMAIL_REPLY_TO ?? productConfig.supportEmail,
  appUrl:
    billingConfig.plan.stripeMode === "live" && configuredAppUrl === billingConfig.approvedProductionAppUrl
      ? billingConfig.approvedProductionAppUrl
      : configuredAppUrl ?? billingConfig.fallbackAppUrl,
  verificationTokenMinutes: 60,
  resetTokenMinutes: 30,
  rateLimitWindowMinutes: 15,
  rateLimitMaxAttempts: 3,
  subjects: {
    verify: `Confirm your ${productConfig.name} email address`,
    reset: `Reset your ${productConfig.name} password`
  },
  messages: {
    genericReset:
      "If an account uses that email address, we will send a password reset link.",
    genericVerification:
      "If we can send a confirmation link, we will email it shortly.",
    emailUnavailable:
      "Email is not ready yet. Please try again later or contact support.",
    rateLimited:
      "Please wait a little while before asking for another email."
  }
} as const;
