import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Terms of Use",
  description:
    "Read the draft Business Sorted terms covering account use, customer responsibilities and plain-English business administration guidance.",
  path: "/terms"
});

export default function TermsPage() {
  return <LegalPage {...legalPages.terms} />;
}
