import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/config/site";
import { resourceGuides, resourcePath } from "@/content/resources";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Resources",
  description:
    "Plain-English UK business deadline guides for first-time owners, covering Companies House, HMRC, VAT, PAYE, Corporation Tax and Self Assessment.",
  path: "/resources"
});

export default function ResourcesPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${absoluteUrl("/resources")}#webpage`,
      url: absoluteUrl("/resources"),
      name: "Business Sorted Resources",
      description:
        "Plain-English UK business deadline guides for first-time owners.",
      isPartOf: {
        "@id": `${siteConfig.url}/#website`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: absoluteUrl("/resources")
        }
      ]
    }
  ];

  return (
    <PublicPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
        <header className="max-w-3xl">
          <Badge variant="calm">Resource centre</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Plain-English UK business deadline guides
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Learn the recurring Companies House and HMRC deadlines that first-time UK business
            owners usually need to understand. Each guide links to official sources and related
            Business Sorted resources.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {resourceGuides.map((guide) => (
            <Card key={guide.slug}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={resourcePath(guide.slug)} className="hover:text-primary">
                    {guide.shortTitle}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{guide.description}</p>
                <Link
                  href={resourcePath(guide.slug)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
                >
                  Read the guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </PublicPage>
  );
}
