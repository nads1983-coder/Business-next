"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { syncBusinessTasks } from "@/lib/task-engine";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";

const settingsSchema = z.object({
  businessId: z.string().min(1),
  legalBusinessName: z.string().trim().min(1).max(120),
  tradingName: z.string().trim().max(120).optional(),
  companyNumber: z.string().trim().max(8).optional(),
  startedTradingOn: z.string().optional(),
  companyRegisteredOn: z.string().optional(),
  firstAccountingPeriodEnd: z.string().optional(),
  businessYearEndMonth: z.coerce.number().min(1).max(12).optional(),
  registeredForVat: z.enum(["YES", "NO", "NOT_SURE"]),
  vatRegisteredOn: z.string().optional(),
  vatPeriodEndsOn: z.string().optional(),
  employsPeople: z.enum(["YES", "NO", "NOT_SURE"]),
  firstPayday: z.string().optional(),
  wantsEmailReminders: z.enum(["YES", "NO"]),
  reminderPreference: z.enum(["standard", "reduced", "critical"]),
  reminderSnoozedUntil: z.string().optional(),
  reminderPreferredHour: z.coerce.number().min(0).max(23),
  reminderTimezone: z.string().trim().min(1).max(80)
});

const acknowledgeCompaniesHouseChangeSchema = z.object({
  changeId: z.string().min(1)
});

const toDate = (value?: string) => (value ? new Date(`${value}T00:00:00.000Z`) : null);

export async function updateBusinessSettingsAction(_: unknown, formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = settingsSchema.safeParse({
    businessId: formData.get("businessId"),
    legalBusinessName: formData.get("legalBusinessName"),
    tradingName: formData.get("tradingName") || undefined,
    companyNumber: formData.get("companyNumber") || undefined,
    startedTradingOn: formData.get("startedTradingOn") || undefined,
    companyRegisteredOn: formData.get("companyRegisteredOn") || undefined,
    firstAccountingPeriodEnd: formData.get("firstAccountingPeriodEnd") || undefined,
    businessYearEndMonth: formData.get("businessYearEndMonth") || undefined,
    registeredForVat: formData.get("registeredForVat"),
    vatRegisteredOn: formData.get("vatRegisteredOn") || undefined,
    vatPeriodEndsOn: formData.get("vatPeriodEndsOn") || undefined,
    employsPeople: formData.get("employsPeople"),
    firstPayday: formData.get("firstPayday") || undefined,
    wantsEmailReminders: formData.get("wantsEmailReminders"),
    reminderPreference: formData.get("reminderPreference"),
    reminderSnoozedUntil: formData.get("reminderSnoozedUntil") || undefined,
    reminderPreferredHour: formData.get("reminderPreferredHour"),
    reminderTimezone: formData.get("reminderTimezone")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { id: parsed.data.businessId, userId: user.id },
    include: { profile: true }
  });

  if (!business?.profile) {
    return { ok: false, message: "Business not found." };
  }

  const previous = {
    startedTradingOn: business.profile.startedTradingOn,
    companyRegisteredOn: business.profile.companyRegisteredOn,
    firstAccountingPeriodEnd: business.profile.firstAccountingPeriodEnd,
    vatPeriodEndsOn: business.profile.vatPeriodEndsOn,
    firstPayday: business.profile.firstPayday
  };

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: parsed.data.tradingName || parsed.data.legalBusinessName,
      profile: {
        update: {
          legalBusinessName: parsed.data.legalBusinessName,
          tradingName: parsed.data.tradingName,
          companyNumber: parsed.data.companyNumber?.toUpperCase(),
          startedTradingOn: toDate(parsed.data.startedTradingOn),
          companyRegisteredOn: toDate(parsed.data.companyRegisteredOn),
          firstAccountingPeriodEnd: toDate(parsed.data.firstAccountingPeriodEnd),
          businessYearEndMonth: parsed.data.businessYearEndMonth,
          registeredForVat: parsed.data.registeredForVat,
          vatRegisteredOn: toDate(parsed.data.vatRegisteredOn),
          vatPeriodEndsOn: toDate(parsed.data.vatPeriodEndsOn),
          employsPeople: parsed.data.employsPeople,
          worksAlone: parsed.data.employsPeople === "YES" ? "NO" : "YES",
          firstPayday: toDate(parsed.data.firstPayday),
          wantsEmailReminders: parsed.data.wantsEmailReminders === "YES",
          reminderPreference: parsed.data.reminderPreference,
          reminderSnoozedUntil: toDate(parsed.data.reminderSnoozedUntil),
          reminderPreferredHour: parsed.data.reminderPreferredHour,
          reminderTimezone: parsed.data.reminderTimezone
        }
      }
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { consentEmailReminders: parsed.data.wantsEmailReminders === "YES" }
  });

  const result = await syncBusinessTasks(business.id, user.id);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "business_profile_updated",
      metadata: { businessId: business.id, previous, taskSync: result }
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/tasks");
  return { ok: true, message: `Saved. Deadlines recalculated: ${result.created} created, ${result.updated} updated, ${result.skipped} preserved.` };
}

export async function acknowledgeCompaniesHouseChangeAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = acknowledgeCompaniesHouseChangeSchema.safeParse({
    changeId: formData.get("changeId")
  });

  if (!parsed.success) {
    throw new Error("Change record not found.");
  }

  const prisma = getPrisma();
  const change = await prisma.companiesHouseChange.findFirst({
    where: {
      id: parsed.data.changeId,
      business: { userId: user.id }
    },
    select: { id: true, businessId: true, field: true, companyNumber: true, acknowledgedAt: true }
  });

  if (!change) {
    throw new Error("Change record not found.");
  }

  if (!change.acknowledgedAt) {
    const acknowledgedAt = new Date();
    await prisma.companiesHouseChange.update({
      where: { id: change.id },
      data: {
        viewedAt: acknowledgedAt,
        acknowledgedAt
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "companies_house_change_acknowledged",
        metadata: {
          businessId: change.businessId,
          companyNumber: change.companyNumber,
          field: change.field,
          acknowledgedAt: acknowledgedAt.toISOString()
        }
      }
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
}
