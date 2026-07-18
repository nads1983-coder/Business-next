import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Privacy Notice",
  description:
    "Read how Business Sorted uses account, business profile, billing status and support information to run the service.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return <LegalPage {...legalPages.privacy} />;
}
