import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";

export default function SubscriptionTermsPage() {
  return <LegalPage {...legalPages.subscription} />;
}
