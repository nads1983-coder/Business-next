import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Subscription Terms",
  description:
    "Review Business Sorted draft subscription and cancellation terms for the controlled monthly billing launch.",
  path: "/subscription-terms"
});

export default function SubscriptionTermsPage() {
  return <LegalPage {...legalPages.subscription} />;
}
