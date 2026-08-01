"use server";

import { submitSupportEnquiry, type EnquiryActionState } from "@/lib/support-enquiries";

export type { EnquiryActionState };

export async function submitSupportEnquiryAction(
  _: EnquiryActionState | null,
  formData: FormData
): Promise<EnquiryActionState> {
  return submitSupportEnquiry(formData);
}
