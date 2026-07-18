import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Refund Policy",
  description:
    "Read the draft Business Sorted refund policy for duplicate charges, service-access problems and support-led refund requests.",
  path: "/refunds"
});

export default function RefundsPage() {
  return <LegalPage {...legalPages.refunds} />;
}
