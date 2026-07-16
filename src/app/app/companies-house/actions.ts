"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CompaniesHouseError } from "@/lib/companies-house/client";
import {
  connectCompaniesHouseProfile,
  previewCompany,
  syncCompaniesHouseForBusiness
} from "@/lib/companies-house/sync";
import { requireProductAccess } from "@/lib/billing";

const lookupSchema = z.object({
  companyNumber: z.string().trim().min(2).max(12)
});

const connectSchema = z.object({
  businessId: z.string().min(1),
  companyNumber: z.string().trim().min(2).max(12),
  useCompaniesHouseValues: z.boolean().default(false)
});

function safeError(error: unknown) {
  if (error instanceof CompaniesHouseError) {
    return { ok: false as const, code: error.code, message: error.message };
  }
  return { ok: false as const, code: "unknown", message: "Companies House could not be checked right now." };
}

export async function lookupCompaniesHouseAction(input: { companyNumber: string }) {
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "invalid_company_number", message: "Enter a valid company number." };
  }

  try {
    return { ok: true as const, preview: await previewCompany(parsed.data.companyNumber) };
  } catch (error) {
    return safeError(error);
  }
}

export async function connectCompaniesHouseAction(input: {
  businessId: string;
  companyNumber: string;
  useCompaniesHouseValues?: boolean;
}) {
  const { user } = await requireProductAccess();
  const parsed = connectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "invalid_company_number", message: "Check the company number and try again." };
  }

  try {
    const result = await connectCompaniesHouseProfile({
      businessId: parsed.data.businessId,
      userId: user.id,
      companyNumber: parsed.data.companyNumber,
      useCompaniesHouseValues: parsed.data.useCompaniesHouseValues
    });
    revalidatePath("/app");
    revalidatePath("/app/settings");
    revalidatePath("/app/tasks");
    return {
      ok: true as const,
      message: "Companies House connected.",
      preview: result.preview,
      conflicts: result.conflicts,
      taskSync: result.taskSync,
      autoCompletedTasks: result.autoCompletedTasks
    };
  } catch (error) {
    return safeError(error);
  }
}

export async function refreshCompaniesHouseAction(input: { businessId: string }) {
  const { user } = await requireProductAccess();
  if (!input.businessId) {
    return { ok: false as const, code: "invalid_business", message: "Business profile not found." };
  }

  try {
    const result = await syncCompaniesHouseForBusiness({
      businessId: input.businessId,
      userId: user.id,
      force: true
    });
    revalidatePath("/app");
    revalidatePath("/app/settings");
    revalidatePath("/app/tasks");
    return { ok: true as const, message: "Companies House data refreshed.", result };
  } catch (error) {
    return safeError(error);
  }
}
