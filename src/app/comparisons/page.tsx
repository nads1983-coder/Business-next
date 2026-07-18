import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { comparisonPath, comparisonResources } from "@/content/authority";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "UK business comparison guides",
  description:
    "Compare common UK business admin choices, including limited company vs sole trader, annual accounts vs confirmation statement and PAYE vs Self Assessment.",
  path: "/comparisons"
});

export default function ComparisonsPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Comparisons", path: "/comparisons" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Business Sorted comparison guides",
            itemListElement: comparisonResources.map((comparison, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: comparison.title,
              url: `https://businesssorted.uk${comparisonPath(comparison.slug)}`
            }))
          }
        ]}
      />
      <section className="max-w-3xl">
        <Badge variant="calm">Comparisons</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK business comparison guides</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Side-by-side explainers for choices and filings that first-time owners often confuse. Each comparison links to source-led Business Sorted guides.
        </p>
      </section>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {comparisonResources.map((comparison) => (
          <Card key={comparison.slug}>
            <CardHeader>
              <CardTitle className="text-lg">{comparison.shortTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{comparison.description}</p>
              <Link href={comparisonPath(comparison.slug)} className="inline-flex items-center gap-2 text-sm font-medium text-primary underline">
                Compare options <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicPage>
  );
}
