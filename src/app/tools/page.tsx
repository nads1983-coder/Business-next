import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, ListChecks } from "lucide-react";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "UK business deadline tools",
  description:
    "Interactive UK business deadline calculators and decision tools for first-time owners, with assumptions and official-source reminders.",
  path: "/tools"
});

const tools = [
  {
    title: "Deadline calculators",
    description:
      "Estimate planning reminders for confirmation statements, Corporation Tax, VAT and PAYE using simple date inputs.",
    href: "/tools/deadline-calculators",
    icon: Calculator
  },
  {
    title: "Decision tools",
    description:
      "Answer a few questions to see which Business Sorted guides and official sources are most relevant next.",
    href: "/tools/decision-tools",
    icon: ListChecks
  }
];

export default function ToolsPage() {
  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Business Sorted deadline tools",
            itemListElement: tools.map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: tool.title,
              url: `https://businesssorted.uk${tool.href}`
            }))
          }
        ]}
      />
      <section className="max-w-3xl">
        <Badge variant="calm">Interactive tools</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK business deadline tools</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Lightweight planning tools for first-time owners. They explain their assumptions, point to related guides and avoid giving legal or accounting advice.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{tool.description}</p>
                <Link href={tool.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary underline">
                  Open tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </PublicPage>
  );
}
