import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Notice",
  description: "How Business Sorted handles account, business profile, billing status and support information.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return <LegalPage {...legalPages.privacy} />;
}
