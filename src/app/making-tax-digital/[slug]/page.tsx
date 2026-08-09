import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { mtdContentPages } from "@/content/mtd-products";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { MtdOfferCards } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mtdContentPages.map((page) => ({ slug: page.slug }));
}

function getPage(slug: string) {
  return mtdContentPages.find((page) => page.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};

  return pageMetadata({
    title: `${page.title} | Business Sorted`,
    description: page.description,
    path: `/making-tax-digital/${page.slug}`
  });
}

export default async function MtdLongTailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  const path = `/making-tax-digital/${page.slug}`;

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Making Tax Digital checker", path: "/making-tax-digital-checker" },
            { name: page.title, path }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.title,
            description: page.description,
            url: absoluteUrl(path),
            author: { "@type": "Organization", name: "Business Sorted" },
            publisher: { "@type": "Organization", name: "Business Sorted" },
            datePublished: "2026-08-09",
            dateModified: "2026-08-09"
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faqs.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer }
            }))
          }
        ]}
      />
      <section className="max-w-3xl">
        <Badge variant="calm">Making Tax Digital guide</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">{page.h1}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{page.intro}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/making-tax-digital-checker">
              Use the free checker <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/mtd-starter-pack">Get the MTD Starter Pack</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {page.sections.map((section) => (
          <Card key={section.heading}>
            <CardHeader>
              <CardTitle className="text-lg">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{section.body}</CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-2xl font-semibold tracking-normal">Quick answers</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {page.faqs.map(([question, answer]) => (
            <div key={question}>
              <h3 className="flex gap-2 font-medium">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{question}</span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-normal">Turn the answer into a system</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The free checker gives the likely deadline. The paid packs give the checklist, record routine and next steps.
          </p>
        </div>
        <MtdOfferCards />
      </section>
    </PublicPage>
  );
}
