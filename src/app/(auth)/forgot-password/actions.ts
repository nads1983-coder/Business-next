"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAuthEmailRateLimit, createPasswordResetToken } from "@/lib/auth-tokens";
import { emailConfig } from "@/config/email";
import { sendPasswordResetEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address.")
});

export async function requestPasswordResetAction(_: unknown, formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your email address."
    };
  }

  const email = parsed.data.email.toLowerCase();
  const allowed = await assertAuthEmailRateLimit(email, "PASSWORD_RESET");

  if (!allowed) {
    return {
      ok: true,
      message: emailConfig.messages.genericReset
    };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.passwordHash) {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail({ email, token });
  }

  redirect("/check-email?type=reset");
}
