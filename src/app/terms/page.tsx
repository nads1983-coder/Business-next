import { LegalPage } from "@/components/legal-page";
import { legalPages } from "@/lib/legal-content";

export default function TermsPage() {
  return <LegalPage {...legalPages.terms} />;
}
