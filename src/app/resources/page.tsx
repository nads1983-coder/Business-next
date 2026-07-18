import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { comparisonResources, downloadableResources, topicClusters } from "@/content/authority";
import { absoluteUrl, siteConfig } from "@/config/site";
import { resourceGuides, resourcePath } from "@/content/resources";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { FilingTimeline } from "@/components/authority-visuals";
import { Breadcrumbs } from "@/components/resource-guide";
import { ResourceExplorer } from "@/components/resource-explorer";
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

        <section className="rounded-md border bg-secondary/20 p-4">
          <FilingTimeline />
        </section>

        <ResourceExplorer guides={resourceGuides} comparisons={comparisonResources} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-normal">Topic clusters</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {topicClusters.map((cluster) => (
                <Card key={cluster.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{cluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">{cluster.description}</p>
                    <ul className="space-y-2 text-sm">
                      {cluster.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} className="text-primary underline">{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <aside className="rounded-md border bg-secondary/30 p-5">
            <h2 className="text-2xl font-semibold tracking-normal">Printable resources</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Download checklist PDFs generated from shared Business Sorted source data.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {downloadableResources.map((download) => (
                <li key={download.slug}>
                  <a href={`/downloads/${download.slug}`} className="text-primary underline">
                    {download.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </PublicPage>
  );
}
