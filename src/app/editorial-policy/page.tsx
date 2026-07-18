import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = createPageMetadata({
  title: "Business Sorted Editorial Policy",
  description:
    "Read the Business Sorted editorial policy for plain-English UK business deadline guides, source use, review dates and update handling.",
  path: "/editorial-policy"
});

export default function EditorialPolicyPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${absoluteUrl("/editorial-policy")}#webpage`,
      url: absoluteUrl("/editorial-policy"),
      name: "Business Sorted Editorial Policy",
      isPartOf: { "@id": `${siteConfig.url}/#website` }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Editorial policy",
          item: absoluteUrl("/editorial-policy")
        }
      ]
    }
  ];

  return (
    <PublicPage narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <div className="space-y-7">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Editorial policy" }]} />
        <header>
          <p className="text-sm font-medium text-primary">Editorial policy</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Business Sorted editorial policy</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Our guides explain UK business deadlines in plain English for first-time owners. They do
            not provide accounting, tax or legal advice.
          </p>
        </header>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Source standards</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Resource pages use official HMRC, Companies House and GOV.UK terminology where possible.
            We avoid unsupported claims, invented penalties, fabricated guarantees and copied third-party text.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Review process</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Each guide includes a visible review date. Reviews check whether links still point to the
            relevant official guidance and whether the page still describes the duty clearly for a new owner.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Updates and corrections</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            When official guidance changes, affected pages should be updated promptly. If a reader spots
            unclear wording or a broken source link, they can contact support so the editorial team can review it.
          </p>
        </section>
        <nav className="flex flex-wrap gap-4 text-sm text-primary underline">
          <Link href="/about">About Business Sorted</Link>
          <Link href="/how-we-research">How we research</Link>
          <Link href="/support">Contact support</Link>
        </nav>
      </div>
    </PublicPage>
  );
}
