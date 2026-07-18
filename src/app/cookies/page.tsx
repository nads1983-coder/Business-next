import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Cookie Information",
  description:
    "Read how Business Sorted uses essential cookies for authentication, security and basic app operation.",
  path: "/cookies"
});

export default function CookiesPage() {
  return <LegalPage {...legalPages.cookies} />;
}
