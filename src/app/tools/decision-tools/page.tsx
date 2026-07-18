import type { Metadata } from "next";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { DecisionTools } from "@/components/decision-tools";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = pageMetadata({
  title: "Which UK business deadlines apply to me?",
  description:
    "Use a plain-English decision tool to identify the Business Sorted guides and official-source checks most likely to matter next.",
  path: "/tools/decision-tools"
});

export default function DecisionToolsPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Decision tools", path: "/tools/decision-tools" }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Business Sorted deadline decision tools",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: absoluteUrl("/tools/decision-tools"),
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }
          }
        ]}
      />
      <section className="mb-10 max-w-3xl">
        <Badge variant="calm">Decision tool</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Which UK business deadlines apply to me?</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Answer a few practical questions and get a reasoned list of next checks. The output is guidance triage, not legal or accounting advice.
        </p>
      </section>
      <DecisionTools />
    </PublicPage>
  );
}
