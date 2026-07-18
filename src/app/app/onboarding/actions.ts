"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CompaniesHouseError, normaliseCompanyNumber } from "@/lib/companies-house/client";
import { companiesHouseSnapshotUpdate, previewCompany } from "@/lib/companies-house/sync";
import { syncBusinessTasks } from "@/lib/task-engine";
import { onboardingSchema } from "@/lib/onboarding";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const toDate = (value?: string) => (value ? new Date(`${value}T00:00:00.000Z`) : null);
const toPence = (value: number) => Math.round(value * 100);

async function companiesHouseOnboardingPatch(companyNumber?: string, confirmedCompanyNumber?: string) {
  if (!companyNumber || !confirmedCompanyNumber) {
    return { data: {}, audit: { connected: false, reason: "not_confirmed" } };
  }

  const normalisedCompanyNumber = normaliseCompanyNumber(companyNumber);
  if (normaliseCompanyNumber(confirmedCompanyNumber) !== normalisedCompanyNumber) {
    return { data: {}, audit: { connected: false, reason: "company_number_changed" } };
  }

  try {
    const preview = await previewCompany(normalisedCompanyNumber);
    if (preview.companyNumber !== normalisedCompanyNumber) {
      return { data: {}, audit: { connected: false, reason: "company_number_mismatch" } };
    }

    return {
      data: companiesHouseSnapshotUpdate(preview),
      audit: {
        connected: true,
        companyNumber: preview.companyNumber,
        companyStatus: preview.companyStatus,
        source: "companies_house"
      }
    };
  } catch (error) {
    return {
      data: {},
      audit: {
        connected: false,
        reason: error instanceof CompaniesHouseError ? error.code : "lookup_failed"
      }
    };
  }
}

export async function completeOnboardingAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    businessType: formData.get("businessType"),
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
    usesAccountant: formData.get("usesAccountant"),
    wantsEmailReminders: formData.get("wantsEmailReminders"),
    salesSoFar: formData.get("salesSoFar") || 0,
    costsSoFar: formData.get("costsSoFar") || 0,
    canUpdateLater: formData.get("canUpdateLater")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your answers. You can update missing details later."
    };
  }

  const prisma = getPrisma();
  const existing = await prisma.business.findFirst({
    where: { userId: user.id },
    include: { profile: true },
    orderBy: { createdAt: "desc" }
  });

  const data = parsed.data;
  const businessName = data.tradingName || data.legalBusinessName;
  const companiesHouse = await companiesHouseOnboardingPatch(
    data.businessType === "LIMITED_COMPANY" ? data.companyNumber : undefined,
    formData.get("companiesHouseConfirmedCompanyNumber")?.toString()
  );

  const business = existing
    ? await prisma.business.update({
        where: { id: existing.id },
        data: {
          name: businessName,
          type: data.businessType,
          profile: {
            upsert: {
              create: {
                businessType: data.businessType,
                legalBusinessName: data.legalBusinessName,
                tradingName: data.tradingName,
                companyNumber: data.companyNumber?.toUpperCase(),
                startedTradingOn: toDate(data.startedTradingOn),
                companyRegisteredOn: toDate(data.companyRegisteredOn),
                firstAccountingPeriodEnd: toDate(data.firstAccountingPeriodEnd),
                registeredForVat: data.registeredForVat,
                vatRegisteredOn: toDate(data.vatRegisteredOn),
                vatPeriodEndsOn: toDate(data.vatPeriodEndsOn),
                employsPeople: data.employsPeople,
                worksAlone: data.employsPeople === "YES" ? "NO" : "YES",
                usesAccountant: data.usesAccountant,
                businessYearEndMonth: data.businessYearEndMonth,
                wantsEmailReminders: data.wantsEmailReminders === "YES",
                salesSoFarPence: toPence(data.salesSoFar),
                costsSoFarPence: toPence(data.costsSoFar),
                ...companiesHouse.data,
                onboardingCompletedAt: new Date()
              },
              update: {
                businessType: data.businessType,
                legalBusinessName: data.legalBusinessName,
                tradingName: data.tradingName,
                companyNumber: data.companyNumber?.toUpperCase(),
                startedTradingOn: toDate(data.startedTradingOn),
                companyRegisteredOn: toDate(data.companyRegisteredOn),
                firstAccountingPeriodEnd: toDate(data.firstAccountingPeriodEnd),
                registeredForVat: data.registeredForVat,
                vatRegisteredOn: toDate(data.vatRegisteredOn),
                vatPeriodEndsOn: toDate(data.vatPeriodEndsOn),
                employsPeople: data.employsPeople,
                worksAlone: data.employsPeople === "YES" ? "NO" : "YES",
                usesAccountant: data.usesAccountant,
                businessYearEndMonth: data.businessYearEndMonth,
                wantsEmailReminders: data.wantsEmailReminders === "YES",
                salesSoFarPence: toPence(data.salesSoFar),
                costsSoFarPence: toPence(data.costsSoFar),
                ...companiesHouse.data,
                onboardingCompletedAt: new Date()
              }
            }
          }
        }
      })
    : await prisma.business.create({
        data: {
          userId: user.id,
          name: businessName,
          type: data.businessType,
          profile: {
            create: {
              businessType: data.businessType,
              legalBusinessName: data.legalBusinessName,
              tradingName: data.tradingName,
              companyNumber: data.companyNumber?.toUpperCase(),
              startedTradingOn: toDate(data.startedTradingOn),
              companyRegisteredOn: toDate(data.companyRegisteredOn),
              firstAccountingPeriodEnd: toDate(data.firstAccountingPeriodEnd),
              registeredForVat: data.registeredForVat,
              vatRegisteredOn: toDate(data.vatRegisteredOn),
              vatPeriodEndsOn: toDate(data.vatPeriodEndsOn),
              employsPeople: data.employsPeople,
              worksAlone: data.employsPeople === "YES" ? "NO" : "YES",
              usesAccountant: data.usesAccountant,
              businessYearEndMonth: data.businessYearEndMonth,
              wantsEmailReminders: data.wantsEmailReminders === "YES",
              salesSoFarPence: toPence(data.salesSoFar),
              costsSoFarPence: toPence(data.costsSoFar),
              ...companiesHouse.data,
              onboardingCompletedAt: new Date()
            }
          }
        }
      });

  await prisma.user.update({
    where: { id: user.id },
    data: { consentEmailReminders: data.wantsEmailReminders === "YES" }
  });

  const result = await syncBusinessTasks(business.id, user.id);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: existing ? "business_profile_completed_stage_2" : "business_onboarding_completed",
      metadata: { businessId: business.id, taskSync: result, companiesHouse: companiesHouse.audit }
    }
  });

  revalidatePath("/app");
  redirect("/app");
}
