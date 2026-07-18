import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = createPageMetadata({
  title: "About Business Sorted",
  description:
    "Learn who Business Sorted is for, how the editorial team explains UK business deadlines and why official HMRC and Companies House sources matter.",
  path: "/about"
});

export default function AboutPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${absoluteUrl("/about")}#webpage`,
      url: absoluteUrl("/about"),
      name: "About Business Sorted",
      isPartOf: { "@id": `${siteConfig.url}/#website` }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") }
      ]
    }
  ];

  return (
    <PublicPage narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <div className="space-y-7">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <header>
          <p className="text-sm font-medium text-primary">About</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">About Business Sorted</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Business Sorted helps first-time UK business owners understand the admin deadlines that
            come with running a business, using plain English and links to official sources.
          </p>
        </header>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Who writes the guides</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            The Business Sorted editorial team writes and maintains the resource centre. The content is
            designed for clarity, not professional advice. Guides are checked against official HMRC and
            Companies House terminology before publication.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">What Business Sorted covers</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            We focus on deadlines and responsibilities that first-time owners often meet early:
            Companies House filings, Corporation Tax, VAT, PAYE, Self Assessment and related business
            record keeping.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">How to use the information</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Use the guides to understand the shape of a duty and the words HMRC or Companies House may
            use. Before filing, paying or making a business decision, check the official source and get
            professional advice where needed.
          </p>
        </section>
        <nav className="flex flex-wrap gap-4 text-sm text-primary underline">
          <Link href="/resources">Browse resources</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/how-we-research">How we research</Link>
        </nav>
      </div>
    </PublicPage>
  );
}
