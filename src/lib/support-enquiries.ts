import { randomUUID } from "node:crypto";
import { z } from "zod";
import { logNotificationFailure } from "@/lib/notifications/email-client";
import { sendEnquiryNotification } from "@/lib/notifications/send-enquiry-notification";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  telephone: z.string().trim().max(40).optional(),
  companyName: z.string().trim().max(160).optional(),
  category: z.enum(["account", "billing", "product", "technical", "other"]),
  message: z.string().trim().min(10, "Please include a short message.").max(2000),
  source: z.string().trim().max(120).default("/support"),
  website: z.string().trim().max(200).optional()
});

export type EnquiryActionState = {
  ok: boolean;
  message: string;
};

export async function submitSupportEnquiry(formData: FormData): Promise<EnquiryActionState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    telephone: formData.get("telephone") || undefined,
    companyName: formData.get("companyName") || undefined,
    category: formData.get("category"),
    message: formData.get("message"),
    source: formData.get("source") || "/support",
    website: formData.get("website") || undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your enquiry."
    };
  }

  if (parsed.data.website) {
    return {
      ok: true,
      message: "Thanks, your enquiry has been received."
    };
  }

  const enquiryId = randomUUID();

  try {
    await sendEnquiryNotification({
      enquiryId,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      telephone: parsed.data.telephone,
      companyName: parsed.data.companyName,
      category: parsed.data.category,
      message: parsed.data.message,
      source: parsed.data.source,
      submittedAt: new Date()
    });
  } catch (error) {
    logNotificationFailure({ eventType: "enquiry", recordId: enquiryId, error });
  }

  return {
    ok: true,
    message: "Thanks, your enquiry has been received."
  };
}
