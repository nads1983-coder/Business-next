import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = pageMetadata({
  title: "UK business admin glossary",
  description: "Plain-English definitions for UK business admin terms including confirmation statements, Corporation Tax and annual accounts.",
  path: "/glossary"
});

const terms = [
  ["Annual accounts", "Accounts prepared from company records at the end of the financial year and filed with Companies House.", "/guides/companies-house/annual-accounts-deadline-explained"],
  ["Company Tax Return", "The HMRC return used by companies to report profit or loss and work out Corporation Tax.", "/guides/hmrc/corporation-tax-deadlines-for-limited-companies"],
  ["Confirmation statement", "A Companies House filing used to confirm that key company information is accurate.", "/guides/companies-house/confirmation-statement-deadline-explained"],
  ["Corporation Tax", "Tax paid by limited companies and certain organisations on taxable profits.", "/guides/hmrc/corporation-tax-deadlines-for-limited-companies"],
  ["Director responsibilities", "The legal and admin duties a UK limited company director remains responsible for, even when they hire help.", "/guides/limited-companies/director-responsibilities-uk"],
  ["Self Assessment", "The HMRC system many sole traders use to report income and pay Income Tax and National Insurance based on profits.", "/guides/sole-traders/sole-trader-tax-and-record-keeping-checklist"]
];

export default function GlossaryPage() {
  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Glossary</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK business admin glossary</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Short definitions for the Companies House, HMRC and record-keeping terms first-time business owners meet.
        </p>
      </section>

      <dl className="mt-10 grid gap-5 md:grid-cols-2">
        {terms.map(([term, definition, href]) => (
          <div key={term} className="rounded-md border p-5">
            <dt className="text-lg font-semibold tracking-normal">{term}</dt>
            <dd className="mt-2 text-sm leading-6 text-muted-foreground">{definition}</dd>
            <Link href={href} className="mt-3 inline-block text-sm font-medium text-primary underline">
              Read more about {term.toLowerCase()}
            </Link>
          </div>
        ))}
      </dl>
    </PublicPage>
  );
}
