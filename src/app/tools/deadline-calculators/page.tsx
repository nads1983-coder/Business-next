import type { Metadata } from "next";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { DeadlineCalculators } from "@/components/deadline-calculators";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = pageMetadata({
  title: "UK business deadline calculators",
  description:
    "Estimate planning reminders for confirmation statements, Corporation Tax, VAT and PAYE. Includes assumptions, method and related official-source guides.",
  path: "/tools/deadline-calculators"
});

export default function DeadlineCalculatorPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Deadline calculators", path: "/tools/deadline-calculators" }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Business Sorted UK business deadline calculators",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: absoluteUrl("/tools/deadline-calculators"),
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }
          }
        ]}
      />
      <section className="mb-10 max-w-3xl">
        <Badge variant="calm">Calculator</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK business deadline calculators</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Estimate planning reminders for common filing and tax tasks. Use the result as a prompt to check the official source, not as a final filing date.
        </p>
      </section>
      <DeadlineCalculators />
    </PublicPage>
  );
}
