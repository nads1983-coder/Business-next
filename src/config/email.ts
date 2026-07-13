import { productConfig } from "@/config/product";

export const emailConfig = {
  from: process.env.EMAIL_FROM ?? "",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "https://files-mentioned-by-the-user-build-umber.vercel.app",
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
