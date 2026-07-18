import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { productConfig } from "@/config/product";
import { getResourceArticle, type ResourceArticle } from "@/content/resources";
import { JsonLd, organizationSchema, pageMetadata, websiteSchema } from "@/lib/seo";
import { MobileNav } from "@/components/mobile-nav";
import { PublicFooter, publicNavItems } from "@/components/public-page";
import { ResourceCard } from "@/components/resource-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "UK business deadline tracker | Business Sorted",
  description: "Track Companies House, HMRC and small-business admin deadlines in plain English. Built for first-time UK founders and directors.",
  path: "/"
});

const featuredResourceSlugs = [
  "companies-house-deadlines",
  "confirmation-statement-guide",
  "first-year-companies-house-checklist"
] as const;

const featuredResources = featuredResourceSlugs
  .map((slug) => getResourceArticle(slug))
  .filter((article): article is ResourceArticle => article?.status === "published");

export default function MarketingPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: productConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://businesssorted.uk",
    description:
      "A plain-English UK business administration and compliance assistant for first-time founders and small-business owners.",
    offers: {
      "@type": "Offer",
      price: "9",
      priceCurrency: "GBP",
      availability: "https://schema.org/PreOrder",
      url: "https://businesssorted.uk/pricing"
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <JsonLd data={[organizationSchema(), websiteSchema(), softwareSchema]} />
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="font-semibold">
            {productConfig.name}
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex" aria-label="Primary">
            {publicNavItems.filter((item) => item.href !== "/support").map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav items={publicNavItems} footer={productConfig.tradingNameDisclosure} />
        </div>
      </header>

      <section id="main-content" tabIndex={-1} className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">For first-time UK founders, directors and sole traders</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Keep your UK business deadlines under control
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Business Sorted helps you understand what your business needs to file, when it is due and what records you need, using plain English and links to official sources.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Find my business deadlines <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resources">
                Browse business deadline resources
              </Link>
            </Button>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
            {productConfig.disclaimer}
          </p>
        </div>

        <div className="grid min-w-0 gap-3">
          {[
            ["Companies House", "Annual accounts and confirmation statement reminders."],
            ["HMRC", "Corporation Tax, Company Tax Return, VAT, PAYE and Self Assessment prompts where relevant."],
            ["Business admin", "Records, paperwork and recurring checklist tasks in one place."]
          ].map(([title, body]) => (
            <Card key={title}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-secondary/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-3">
          {[
            [CalendarCheck, "Know what is due", "Turn company details into a clearer deadline list for Companies House, HMRC and routine business admin."],
            [FileText, "Know what to prepare", "See the records, source links and practical notes that sit behind each task."],
            [ShieldCheck, "Know the limits", "Use Business Sorted for general organisation and plain-English guidance, then get professional advice where your circumstances need it."]
          ].map(([Icon, title, body]) => (
            <section key={title as string}>
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-xl font-semibold tracking-normal">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body as string}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal">Source-checked resources for real first-year questions</h2>
          <p className="mt-3 text-muted-foreground">
            Start with the Companies House questions directors search for when they are trying to avoid missed filings, confusing dates and last-minute paperwork.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredResources.map((article) => (
            <ResourceCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
