import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, ShieldCheck, ShoppingBag } from "lucide-react";
import { amazonAffiliateConfig } from "@/config/affiliate";
import {
  businessEssentialsRecommendations,
  recommendedBusinessEssentialsPath
} from "@/content/affiliate-recommendations";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = createPageMetadata({
  title: "Recommended Business Essentials for UK Small Businesses",
  description:
    "Optional Amazon UK search links for practical home-office, paperwork, postage and admin equipment for UK sole traders, company directors and new business owners.",
  path: recommendedBusinessEssentialsPath
});

const itemList = businessEssentialsRecommendations.map((category, index) => ({
  "@type": "ListItem",
  position: index + 1,
  name: category.title,
  url: `${absoluteUrl(recommendedBusinessEssentialsPath)}#${category.slug}`
}));

export default function RecommendedBusinessEssentialsPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Recommended business essentials", path: recommendedBusinessEssentialsPath }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl(recommendedBusinessEssentialsPath)}#webpage`,
            url: absoluteUrl(recommendedBusinessEssentialsPath),
            name: "Recommended Business Essentials for UK Small Businesses",
            description:
              "Optional Amazon UK search links for practical equipment that may help UK small-business owners organise their work, paperwork and day-to-day administration."
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${absoluteUrl(recommendedBusinessEssentialsPath)}#amazon-uk-searches`,
            name: "Amazon UK business essentials search categories",
            itemListElement: itemList
          }
        ]}
      />
      <div className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: "Recommended business essentials" }
          ]}
        />

        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="max-w-3xl">
            <Badge variant="calm">Optional recommendations</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              Recommended Business Essentials for UK Small Businesses
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              A practical starting list for UK sole traders, limited-company directors and first-time
              business owners who want to organise a basic work setup. These are general Amazon UK
              search links, not must-buy items or personalised recommendations.
            </p>
          </div>
          <aside className="rounded-md border bg-secondary/30 p-5">
            <h2 className="text-xl font-semibold tracking-normal">Keep purchases in context</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Business Sorted is here to help with deadlines, compliance guidance and admin
              organisation. Equipment is secondary: choose only what suits your work, space and budget.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/register">
                  Start deadline setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </aside>
        </header>

        <section className="rounded-md border border-primary/30 bg-secondary/30 p-5 sm:p-6" aria-labelledby="affiliate-disclosure-heading">
          <div className="flex gap-3">
            <ShoppingBag className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <h2 id="affiliate-disclosure-heading" className="text-xl font-semibold tracking-normal text-foreground">
                Affiliate disclosure
              </h2>
              <p>{amazonAffiliateConfig.disclosure}</p>
              <p>
                Purchases are made from Amazon, not Business Sorted. Business Sorted does not handle
                Amazon orders, delivery, returns or warranties, and Amazon does not sponsor, endorse
                or operate Business Sorted.
              </p>
              <p>
                An item being useful for business does not automatically make it tax-deductible. Tax
                treatment depends on the circumstances, so check HMRC guidance or obtain professional
                advice before relying on a cost as allowable.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="recommendations-heading">
          <div className="max-w-3xl">
            <h2 id="recommendations-heading" className="text-2xl font-semibold tracking-normal">
              Practical categories to compare
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The links below open Amazon UK search results with the affiliate tag applied. Check
              specifications, seller details, delivery, returns and current pricing on Amazon before
              buying.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessEssentialsRecommendations.map((category) => (
              <Card key={category.title} id={category.slug} className="flex flex-col scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-lg leading-6">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 text-sm leading-6 text-muted-foreground">
                  <p>{category.description}</p>
                  <ul className="space-y-2">
                    {category.prompts.map((prompt) => (
                      <li key={prompt} className="flex gap-2">
                        <span aria-hidden="true">-</span>
                        <span>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    className="mt-auto inline-flex items-center gap-2 font-medium text-primary underline"
                    href={category.searchUrl}
                    target={amazonAffiliateConfig.target}
                    rel={amazonAffiliateConfig.linkRel}
                  >
                    {category.searchLabel}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2" aria-labelledby="buying-notes-heading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                Before you buy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Start with the problem you are solving: calls, records, postage, receipts,
                bookkeeping or comfort. A cheaper, simpler item may be enough.
              </p>
              <p>
                Keep receipts and order confirmations where you can find them, especially if you
                later discuss business costs with an accountant or tax adviser.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                Keep compliance first
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Equipment can make admin easier, but it will not replace deadlines, records and
                filings. Use Business Sorted to keep the important tasks visible.
              </p>
              <p>
                For filing and tax guidance, start with the source-linked resources rather than a
                shopping list.
              </p>
              <nav className="flex flex-wrap gap-4 text-sm text-primary underline" aria-label="Related Business Sorted links">
                <Link href="/resources">Browse compliance resources</Link>
                <Link href="/tools">Use business tools</Link>
                <Link href="/pricing">See paid product options</Link>
              </nav>
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicPage>
  );
}
