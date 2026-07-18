import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import {
  formatResourceDate,
  getFeaturedResourceArticles,
  getResourceArticlesByCategory,
  getResourceArticlesByGroup,
  resourceCategories,
  resourceCategoryPath,
  resourceGroups,
  resourcePath,
  type ResourceGroup
} from "@/content/resources";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import { Breadcrumbs, ResourceCard } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const category = resourceCategories["companies-house"];
const groupOrder: ResourceGroup[] = [
  "confirmation-statements",
  "company-accounts",
  "company-information",
  "authentication-access",
  "dormant-companies",
  "directors-first-year"
];

export const metadata: Metadata = createPageMetadata({
  title: "Companies House resources",
  description:
    "Source-linked Companies House guides for UK limited company directors, including confirmation statements, accounts, company information and first-year tasks.",
  path: resourceCategoryPath("companies-house")
});

const categoryFaqs = [
  {
    question: "Are Companies House and HMRC deadlines the same?",
    answer:
      "No. Companies House filings and HMRC tax tasks can relate to the same business records, but they are separate processes with separate official guidance."
  },
  {
    question: "Can BusinessSorted file Companies House documents for me?",
    answer:
      "No. BusinessSorted helps organise important company obligations and deadlines. It does not file Companies House documents on your behalf."
  }
] as const;

export default function CompaniesHouseResourcesPage() {
  const articles = getResourceArticlesByCategory("companies-house");
  const featured = getFeaturedResourceArticles().filter((article) => article.category === "companies-house");
  const recentlyReviewed = [...articles].sort((left, right) =>
    right.lastReviewedDate.localeCompare(left.lastReviewedDate)
  );

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: category.label, path: resourceCategoryPath("companies-house") }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl(resourceCategoryPath("companies-house"))}#webpage`,
            url: absoluteUrl(resourceCategoryPath("companies-house")),
            name: "Companies House resources",
            description: category.description
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: categoryFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
              }
            }))
          }
        ]}
      />
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: category.label }
          ]}
        />

        <header className="max-w-3xl">
          <Badge variant="calm">{category.label}</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">Companies House resources</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {category.introduction} Use this page to move from the broad deadlines picture into the
            specific filing, access or company-information question you need to answer next.
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">Foundational guides</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start here if you are setting up your first Companies House reminder system.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((article) => (
              <ResourceCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Companies House resource sections">
          {groupOrder.map((group) => {
            const groupArticles = getResourceArticlesByGroup(group);
            const groupMeta = resourceGroups[group];

            return (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                    {groupMeta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">{groupMeta.description}</p>
                  <ul className="space-y-2 text-sm">
                    {groupArticles.map((article) => (
                      <li key={article.slug}>
                        <Link href={resourcePath(article.slug)} className="text-primary underline">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-normal">Recently reviewed</h2>
            <div className="rounded-md border">
              <ul className="divide-y text-sm">
                {recentlyReviewed.slice(0, 8).map((article) => (
                  <li key={article.slug} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={resourcePath(article.slug)} className="font-medium text-primary underline">
                      {article.title}
                    </Link>
                    <span className="text-muted-foreground">
                      Reviewed {formatResourceDate(article.lastReviewedDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categoryFaqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside className="rounded-md border bg-secondary/30 p-5">
            <h2 className="text-2xl font-semibold tracking-normal">Keep obligations visible</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep your Companies House obligations visible. BusinessSorted organises your important
              company tasks and deadlines in one practical dashboard.
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
