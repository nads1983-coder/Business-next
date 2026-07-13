import { createHash, createHmac, randomBytes } from "node:crypto";
import { addMinutes } from "date-fns";
import type { AuthEmailPurpose } from "@prisma/client";
import { emailConfig } from "@/config/email";
import { getPrisma } from "@/lib/prisma";

export function createPlainToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashEmailForRateLimit(email: string) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "local-rate-limit";
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex");
}

export function addTokenMinutes(purpose: AuthEmailPurpose) {
  return addMinutes(
    new Date(),
    purpose === "EMAIL_VERIFICATION"
      ? emailConfig.verificationTokenMinutes
      : emailConfig.resetTokenMinutes
  );
}

export async function assertAuthEmailRateLimit(email: string, purpose: AuthEmailPurpose) {
  const prisma = getPrisma();
  const emailHash = hashEmailForRateLimit(email);
  const since = addMinutes(new Date(), -emailConfig.rateLimitWindowMinutes);
  const recentAttempts = await prisma.authEmailAttempt.count({
    where: {
      emailHash,
      purpose,
      createdAt: {
        gte: since
      }
    }
  });

  if (recentAttempts >= emailConfig.rateLimitMaxAttempts) {
    return false;
  }

  await prisma.authEmailAttempt.create({
    data: {
      emailHash,
      purpose
    }
  });

  return true;
}

export async function createVerificationToken(userId: string) {
  const prisma = getPrisma();
  const token = createPlainToken();
  const identifier = `email-verification:${userId}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(token),
      expires: addTokenMinutes("EMAIL_VERIFICATION")
    }
  });

  return token;
}

export async function createPasswordResetToken(userId: string) {
  const prisma = getPrisma();
  const token = createPlainToken();

  await prisma.user.update({
    where: { id: userId },
    data: {
      resetTokenHash: hashToken(token),
      resetTokenExpiresAt: addTokenMinutes("PASSWORD_RESET")
    }
  });

  return token;
}
