import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Business Sorted support",
  description: "Contact Business Sorted for account, billing or product support.",
  path: "/support"
});

export default function SupportPage() {
  return <LegalPage {...legalPages.support} />;
}
