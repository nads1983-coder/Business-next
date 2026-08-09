import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { MakingTaxDigitalChecker } from "@/components/making-tax-digital-checker";
import { MtdOfferCards } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const path = "/making-tax-digital-checker";

export const metadata: Metadata = pageMetadata({
  title: "Making Tax Digital Checker UK 2026 | Do You Need MTD?",
  description:
    "Use the free Business Sorted Making Tax Digital checker for UK sole traders and landlords. Estimate your MTD Income Tax start date and next steps.",
  path
});

const faqs = [
  {
    question: "Who needs Making Tax Digital for Income Tax?",
    answer:
      "GOV.UK says Making Tax Digital for Income Tax applies to sole traders and landlords registered for Self Assessment with qualifying self-employment or property income over the relevant threshold."
  },
  {
    question: "When does Making Tax Digital start?",
    answer:
      "The published phases are 6 April 2026 for qualifying income over GBP 50,000, 6 April 2027 for over GBP 30,000, and 6 April 2028 for over GBP 20,000."
  },
  {
    question: "Can I use spreadsheets for Making Tax Digital?",
    answer:
      "Spreadsheets alone are not enough unless they work with MTD-compatible software or bridging software that can send the required updates to HMRC."
  },
  {
    question: "Is this checker tax advice?",
    answer:
      "No. It is a plain-English planning tool. Check GOV.UK, HMRC notices and a qualified accountant or tax adviser for your circumstances."
  }
];

export default function MakingTaxDigitalCheckerPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Making Tax Digital checker", path }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Making Tax Digital Checker UK 2026",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: absoluteUrl(path),
            description:
              "A free checker that helps UK sole traders and landlords estimate whether Making Tax Digital for Income Tax may apply and when to prepare.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
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

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div className="max-w-3xl">
          <Badge variant="calm">Free MTD tool</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Do I need Making Tax Digital in 2026?
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Answer a few questions to estimate whether MTD for Income Tax may apply to you, when it may start, and what to prepare next. Built for UK sole traders, freelancers and landlords.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href="#checker">
                Start the checker <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tools">See all tools</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Published thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            {[
              "Over GBP 50,000: from 6 April 2026",
              "Over GBP 30,000: from 6 April 2027",
              "Over GBP 20,000: from 6 April 2028"
            ].map((item) => (
              <p key={item} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="checker" className="mt-10 scroll-mt-6">
        <MakingTaxDigitalChecker />
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          [
            "1. Check if you are in scope",
            "MTD Income Tax is aimed at sole traders and landlords with qualifying self-employment or property income over the published thresholds."
          ],
          [
            "2. Prepare your records",
            "You may need digital records and quarterly updates through compatible software, rather than leaving everything until January."
          ],
          [
            "3. Confirm with official sources",
            "Use GOV.UK and HMRC notices for the final position, especially if your income sources or exemptions are unusual."
          ]
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-5 max-w-3xl">
          <Badge variant="calm">Hands-off next step</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal">Turn your MTD result into a simple system</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The checker gives the quick answer. The paid packs give the practical &quot;now what?&quot; for records, software, expenses and quarterly routines.
          </p>
        </div>
        <MtdOfferCards />
      </section>

      <section className="mt-12 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-2xl font-semibold tracking-normal">Making Tax Digital FAQs</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-medium">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-md border p-5">
        <h2 className="text-xl font-semibold tracking-normal">Sources checked</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          <li>
            <a
              href="https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax"
              className="text-primary underline"
            >
              GOV.UK: Find out if and when you need to use Making Tax Digital for Income Tax
            </a>
          </li>
          <li>
            <a
              href="https://www.gov.uk/government/publications/update-notice-for-making-tax-digital-for-income-tax"
              className="text-primary underline"
            >
              GOV.UK: Making Tax Digital for Income Tax quarterly update direction
            </a>
          </li>
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Last checked: 9 August 2026. Business Sorted gives general organisation support, not legal, tax or accounting advice.
        </p>
      </section>
    </PublicPage>
  );
}
