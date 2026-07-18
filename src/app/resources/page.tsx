import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Library, SearchCheck } from "lucide-react";
import {
  formatResourceDate,
  getFeaturedResourceArticles,
  getIndexableResourceArticles,
  resourceCategories,
  resourceCategoryPath
} from "@/content/resources";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import { Breadcrumbs, ResourceCard } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = createPageMetadata({
  title: "BusinessSorted resource centre",
  description:
    "Source-linked UK business compliance guides for limited-company directors and small-business owners, reviewed against official guidance.",
  path: "/resources"
});

export default function ResourcesPage() {
  const featuredArticles = getFeaturedResourceArticles();
  const recentlyReviewed = [...getIndexableResourceArticles()].sort((left, right) =>
    right.lastReviewedDate.localeCompare(left.lastReviewedDate)
  );

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/resources")}#webpage`,
            url: absoluteUrl("/resources"),
            name: "BusinessSorted resource centre",
            description:
              "Source-linked UK business compliance guides for limited-company directors and small-business owners."
          }
        ]}
      />
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />

        <header className="max-w-3xl">
          <Badge variant="calm">Resource centre</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            UK business compliance resources
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Practical, source-linked guides for directors and small-business owners who want to
            understand important company obligations without wading through scattered notes. This
            centre is intentionally selective so each guide can stay reviewed, useful and tied to
            official sources.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {Object.values(resourceCategories).map((category) => (
            <Card key={category.slug}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Library className="h-5 w-5 text-primary" aria-hidden="true" />
                  <Link href={resourceCategoryPath(category.slug)} className="hover:text-primary">
                    {category.label}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{category.description}</p>
                <Link href={resourceCategoryPath(category.slug)} className="font-medium text-primary underline">
                  Browse {category.label.toLowerCase()} resources
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-normal">Featured guides</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Demonstration articles for the resource-centre architecture. Future guides can be
              added through the typed content model and validation checks.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredArticles.map((article) => (
              <ResourceCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SearchCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                Recently reviewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                {recentlyReviewed.map((article) => (
                  <li key={article.slug} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                    <Link href={`/resources/${article.slug}`} className="font-medium text-primary underline">
                      {article.title}
                    </Link>
                    <span className="text-muted-foreground">
                      Reviewed {formatResourceDate(article.lastReviewedDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <aside className="rounded-md border bg-secondary/30 p-5">
            <h2 className="text-2xl font-semibold tracking-normal">Organise the dates behind the reading</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              BusinessSorted helps UK business owners organise and keep track of important company
              obligations and deadlines.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button asChild>
                <Link href="/register">
                  Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </aside>
        </section>
      </div>
    </PublicPage>
  );
}
