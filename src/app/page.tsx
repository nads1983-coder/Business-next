import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { productConfig } from "@/config/product";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted | UK Business Deadlines in Plain English",
  description:
    "Business Sorted helps first-time UK business owners organise Companies House, tax, VAT and PAYE tasks with plain-English deadlines and official source links.",
  path: "/"
});

export default function MarketingPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      contactPoint: {
        "@type": "ContactPoint",
        email: productConfig.supportEmail,
        contactType: "customer support",
        areaServed: "GB",
        availableLanguage: "en-GB"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      publisher: {
        "@id": `${siteConfig.url}/#organization`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}/#software`,
      name: productConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteConfig.url,
      description: siteConfig.description,
      audience: {
        "@type": "Audience",
        audienceType: siteConfig.audience
      },
      offers: {
        "@type": "Offer",
        price: "9",
        priceCurrency: "GBP",
        url: absoluteUrl("/pricing")
      }
    }
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            {productConfig.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground" aria-label="Primary">
            <Link href="/resources" className="hover:text-foreground">Resources</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/support" className="hover:text-foreground">Support</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium text-primary">For first-time UK business owners</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            UK business deadlines, sorted in plain English.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Business Sorted turns common Companies House, Self Assessment, Corporation Tax, VAT and PAYE
            responsibilities into clear tasks: what needs doing, when it is due and what to prepare.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            [
              "What needs doing next",
              "A dashboard highlights the next business admin task instead of leaving you to decode a long checklist."
            ],
            [
              "When it is due",
              "Deadlines are shown with source links so you can check the underlying GOV.UK or Companies House guidance."
            ],
            [
              "What you need to complete it",
              "Task pages explain the preparation, records and decisions that usually matter before you act."
            ]
          ].map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {body}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          {productConfig.disclaimer}
        </p>

        <nav className="mt-8 flex flex-wrap gap-4 text-sm text-primary underline" aria-label="Helpful pages">
          <Link href="/resources">Browse deadline guides</Link>
          <Link href="/pricing">See pricing</Link>
          <Link href="/support">Contact support</Link>
          <Link href="/terms">Read the terms</Link>
          <Link href="/privacy">Read the privacy notice</Link>
        </nav>
      </section>
      <section className="border-t bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-sm font-medium text-primary">Built for admin clarity</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              Useful when you are setting up and learning what comes next.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Sole trader and limited company setup paths",
              "Business settings that keep task guidance relevant",
              "Official source links alongside deadline explanations",
              "Billing, cancellation and support information in one place"
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{productConfig.name}</p>
          <nav className="flex flex-wrap gap-4" aria-label="Footer">
            <Link href="/resources" className="hover:text-foreground">Resources</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/support" className="hover:text-foreground">Support</Link>
            <Link href="/editorial-policy" className="hover:text-foreground">Editorial policy</Link>
            <Link href="/subscription-terms" className="hover:text-foreground">Subscription terms</Link>
            <Link href="/refunds" className="hover:text-foreground">Refunds</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
