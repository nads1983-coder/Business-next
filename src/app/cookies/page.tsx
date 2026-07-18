import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Cookie information",
  description: "Cookie information for Business Sorted, including essential app cookies and billing-related Stripe cookies.",
  path: "/cookies"
});

export default function CookiesPage() {
  return <LegalPage {...legalPages.cookies} />;
}
