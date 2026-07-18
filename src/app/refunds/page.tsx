import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Refund policy",
  description: "Business Sorted refund policy and support route for billing or service-access issues.",
  path: "/refunds"
});

export default function RefundsPage() {
  return <LegalPage {...legalPages.refunds} />;
}
