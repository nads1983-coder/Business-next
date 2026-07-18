import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata({
  title: "Subscription and cancellation terms",
  description: "Business Sorted subscription, cancellation and billing terms for the monthly plan.",
  path: "/subscription-terms"
});

export default function SubscriptionTermsPage() {
  return <LegalPage {...legalPages.subscription} />;
}
