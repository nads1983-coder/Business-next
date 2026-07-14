import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function requireAdmin() {
  const user = await requireUser();
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true }
  });

  if (dbUser?.role !== "ADMIN") {
    notFound();
  }

  return user;
}
