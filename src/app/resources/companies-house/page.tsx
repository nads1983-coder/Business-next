import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getResourceArticlesByCategory,
  resourceCategories,
  resourceCategoryPath
} from "@/content/resources";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import { Breadcrumbs, ResourceCard } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const category = resourceCategories["companies-house"];

export const metadata: Metadata = createPageMetadata({
  title: "Companies House resources",
  description:
    "Source-linked Companies House guides for UK limited company directors, including confirmation statements and annual accounts.",
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
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{category.introduction}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <ResourceCard key={article.slug} article={article} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-normal">Companies House questions</h2>
            <div className="grid gap-4">
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
