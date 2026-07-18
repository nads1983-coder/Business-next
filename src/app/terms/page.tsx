import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description: "Business Sorted terms and conditions for the UK business deadline and admin assistant.",
  path: "/terms"
});

export default function TermsPage() {
  return <LegalPage {...legalPages.terms} />;
}
