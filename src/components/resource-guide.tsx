import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, ExternalLink, FileText, ShieldCheck, Video } from "lucide-react";
import { productConfig } from "@/config/product";
import { resourcePath, resourceGuideMap, type ResourceGuide } from "@/content/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Breadcrumbs({
  items
}: {
  items: readonly { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function GuideHeader({ guide }: { guide: ResourceGuide }) {
  const sourceLabels = guide.officialSources.map((source) => source.label).join(", ");

  return (
    <header className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: guide.shortTitle }
        ]}
      />
      <div>
        <Badge variant="calm">Business deadline guide</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">{guide.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{guide.intro}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Written by the Business Sorted editorial team · Reviewed {guide.reviewed}
      </p>
      <dl className="grid gap-3 rounded-md border bg-secondary/30 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-foreground">Last reviewed</dt>
          <dd className="mt-1 text-muted-foreground">{guide.reviewed}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Next review</dt>
          <dd className="mt-1 text-muted-foreground">Within 3 months, or sooner if official guidance changes.</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Primary sources checked</dt>
          <dd className="mt-1 text-muted-foreground">{sourceLabels}</dd>
        </div>
      </dl>
    </header>
  );
}

export function GuideSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
      <div className="text-base leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-primary/30 bg-secondary/40">
      <CardContent className="flex items-start gap-3 p-4 text-sm leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}

export function DeadlineBox({ deadlines }: { deadlines: readonly string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          Important deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          {deadlines.map((deadline) => (
            <li key={deadline} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{deadline}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function QuickAnswer({ guide }: { guide: ResourceGuide }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Need to know in 30 seconds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>{guide.intro}</p>
        <p>
          The safest next step is to identify whether this applies to your business, check the official source and set a preparation reminder before the filing or payment date.
        </p>
      </CardContent>
    </Card>
  );
}

export function PreparationChecklist({ guide }: { guide: ResourceGuide }) {
  const items = [
    `Confirm whether this applies: ${guide.appliesTo}`,
    "Open the relevant HMRC or Companies House account before acting.",
    "Collect records, dates and reference numbers that support the filing.",
    "Set a preparation reminder before the deadline, not only on the deadline.",
    "Save submission receipts, payment references and source links."
  ];

  return (
    <GuideSection title="Preparation checklist">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}

export function RealisticExample({ guide }: { guide: ResourceGuide }) {
  return (
    <GuideSection title="Realistic example">
      <p>
        A first-time owner reads the {guide.shortTitle} guide after receiving a reminder or official message. They check whether the duty applies, note the relevant date from the official account, gather the records listed in the source guidance and save evidence after filing or paying.
      </p>
      <p className="mt-3">
        This example is deliberately general because actual dates and duties can change with your company history, tax registrations, accounting period and HMRC or Companies House notices.
      </p>
    </GuideSection>
  );
}

export function CommonMyths() {
  const myths = [
    "If no money changed hands, no filings can be due.",
    "Companies House and HMRC deadlines are always the same.",
    "A reminder calendar can replace checking the official account.",
    "Filing a form always means any related payment has also been made."
  ];

  return (
    <GuideSection title="Common myths">
      <ul className="space-y-3">
        {myths.map((myth) => (
          <li key={myth} className="flex gap-2">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{myth}</span>
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}

export function VideoExplainerBlock({ guide }: { guide: ResourceGuide }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="h-5 w-5 text-primary" aria-hidden="true" />
          Video explainer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          This guide is ready for a 2-minute explainer and 5-minute walkthrough. No video is embedded until Business Sorted has a reviewed transcript that matches the official-source guidance.
        </p>
        <details className="rounded-md border bg-background p-3">
          <summary className="cursor-pointer font-medium text-foreground">Transcript outline</summary>
          <ol className="mt-3 space-y-2">
            <li>1. What {guide.shortTitle} means.</li>
            <li>2. Who should check whether it applies.</li>
            <li>3. Which dates and records to prepare.</li>
            <li>4. Which official sources to open before acting.</li>
          </ol>
        </details>
      </CardContent>
    </Card>
  );
}

export function PenaltyBox({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
          Penalties and risk
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

export function OfficialSourceCard({
  sources
}: {
  sources: ResourceGuide["officialSources"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          Useful HMRC and Companies House links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                className="inline-flex items-center gap-2 text-primary underline"
                rel="noreferrer"
                target="_blank"
              >
                {source.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function RelatedGuides({ slugs }: { slugs: readonly string[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-normal">Related guides</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {slugs.map((slug) => {
          const guide = resourceGuideMap.get(slug);
          if (!guide) return null;
          return (
            <Link
              key={slug}
              href={resourcePath(slug)}
              className="rounded-lg border bg-card p-4 text-sm hover:border-primary/40"
            >
              <span className="font-medium text-foreground">{guide.shortTitle}</span>
              <span className="mt-2 block text-muted-foreground">{guide.description}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function FAQSection({ faqs }: { faqs: ResourceGuide["faqs"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-normal">Frequently asked questions</h2>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <CardHeader>
              <CardTitle className="text-base">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="rounded-lg border bg-secondary/40 p-6">
      <h2 className="text-2xl font-semibold tracking-normal">
        Turn business deadlines into a clear task list
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {productConfig.name} helps first-time UK business owners see what needs doing, when it is due and
        which official source to check before acting.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/register">
            Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
    </section>
  );
}
