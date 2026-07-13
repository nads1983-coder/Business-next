"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashToken } from "@/lib/auth-tokens";
import { getPrisma } from "@/lib/prisma";

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Use at least 8 characters.")
});

export async function resetPasswordAction(_: unknown, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your new password."
    };
  }

  const prisma = getPrisma();
  const hashedToken = hashToken(parsed.data.token);
  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashedToken,
      resetTokenExpiresAt: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    return {
      ok: false,
      message: "This reset link has expired or has already been used."
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hash(parsed.data.password, 12),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    }
  });

  redirect("/login?reset=1");
}
