"use server";

import { submitSupportEnquiry } from "@/lib/support-enquiries";
import type { EnquiryActionState } from "@/lib/support-enquiries";

export async function submitSupportEnquiryAction(
  _: EnquiryActionState | null,
  formData: FormData
): Promise<EnquiryActionState> {
  return submitSupportEnquiry(formData);
}
