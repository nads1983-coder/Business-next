"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

const ruleContentSchema = z.object({
  ruleId: z.string().min(1),
  plainName: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2000),
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://www.gov.uk/"), "Use a GOV.UK source URL."),
  checkedAt: z.string().min(1),
  active: z.enum(["YES", "NO"]),
  changeNote: z.string().trim().max(500).optional()
});

export async function updateRuleContentAction(_: unknown, formData: FormData) {
  const user = await requireAdmin();
  const parsed = ruleContentSchema.safeParse({
    ruleId: formData.get("ruleId"),
    plainName: formData.get("plainName"),
    description: formData.get("description"),
    sourceUrl: formData.get("sourceUrl"),
    checkedAt: formData.get("checkedAt"),
    active: formData.get("active"),
    changeNote: formData.get("changeNote") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the rule content." };
  }

  const prisma = getPrisma();
  const rule = await prisma.complianceRule.findUnique({ where: { id: parsed.data.ruleId } });
  if (!rule) return { ok: false, message: "Rule not found." };

  await prisma.$transaction([
    prisma.complianceRule.update({
      where: { id: rule.id },
      data: {
        plainName: parsed.data.plainName,
        description: parsed.data.description,
        sourceUrl: parsed.data.sourceUrl,
        checkedAt: new Date(`${parsed.data.checkedAt}T00:00:00.000Z`),
        reviewStatus: parsed.data.active === "YES" ? "CURRENT" : "RETIRED"
      }
    }),
    prisma.complianceRuleContentVersion.create({
      data: {
        complianceRuleId: rule.id,
        plainName: parsed.data.plainName,
        description: parsed.data.description,
        sourceUrl: parsed.data.sourceUrl,
        checkedAt: new Date(`${parsed.data.checkedAt}T00:00:00.000Z`),
        active: parsed.data.active === "YES",
        changedByUserId: user.id,
        changeNote: parsed.data.changeNote
      }
    })
  ]);

  revalidatePath("/app/admin");
  return { ok: true, message: "Rule explanation saved. Calculation logic was not changed." };
}
