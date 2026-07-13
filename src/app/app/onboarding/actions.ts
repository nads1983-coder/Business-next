"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildInitialTasks } from "@/lib/task-engine";
import { onboardingSchema } from "@/lib/onboarding";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const toDate = (value?: string) => (value ? new Date(`${value}T00:00:00.000Z`) : null);
const toPence = (value: number) => Math.round(value * 100);

export async function completeOnboardingAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    businessType: formData.get("businessType"),
    worksAlone: formData.get("worksAlone"),
    startedTradingOn: formData.get("startedTradingOn") || undefined,
    companyRegisteredOn: formData.get("companyRegisteredOn") || undefined,
    paysSelfThroughCompany: formData.get("paysSelfThroughCompany"),
    registeredForVat: formData.get("registeredForVat"),
    usesAccountant: formData.get("usesAccountant"),
    businessYearEndMonth: formData.get("businessYearEndMonth") || undefined,
    wantsEmailReminders: formData.get("wantsEmailReminders"),
    salesSoFar: formData.get("salesSoFar") || 0,
    costsSoFar: formData.get("costsSoFar") || 0
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your answers. You can choose 'I am not sure' where shown."
    };
  }

  const prisma = getPrisma();
  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: parsed.data.businessType === "LIMITED_COMPANY" ? "My limited company" : "My business",
      type: parsed.data.businessType,
      profile: {
        create: {
          businessType: parsed.data.businessType,
          worksAlone: parsed.data.worksAlone,
          startedTradingOn: toDate(parsed.data.startedTradingOn),
          companyRegisteredOn: toDate(parsed.data.companyRegisteredOn),
          paysSelfThroughCompany: parsed.data.paysSelfThroughCompany,
          registeredForVat: parsed.data.registeredForVat,
          usesAccountant: parsed.data.usesAccountant,
          businessYearEndMonth: parsed.data.businessYearEndMonth,
          wantsEmailReminders: parsed.data.wantsEmailReminders === "YES",
          salesSoFarPence: toPence(parsed.data.salesSoFar),
          costsSoFarPence: toPence(parsed.data.costsSoFar),
          onboardingCompletedAt: new Date()
        }
      },
      reminders: parsed.data.wantsEmailReminders === "YES"
        ? {
            create: [
              {
                title: "Add this week's sales",
                frequency: "WEEKLY",
                sendEmail: true
              },
              {
                title: "Save business cost receipts",
                frequency: "WEEKLY",
                sendEmail: true
              }
            ]
          }
        : undefined
    },
    include: {
      profile: true
    }
  });

  if (business.profile) {
    await prisma.task.createMany({
      data: buildInitialTasks(business.profile).map((task) => ({
        businessId: business.id,
        ...task
      }))
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "business_onboarding_completed",
      metadata: { businessId: business.id }
    }
  });

  revalidatePath("/app");
  redirect("/app");
}
