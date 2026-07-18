import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Support",
  description:
    "Contact Business Sorted for account, billing or product support for plain-English UK business deadline guidance.",
  path: "/support"
});

export default function SupportPage() {
  return <LegalPage {...legalPages.support} />;
}
