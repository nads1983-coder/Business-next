import { legalNotice } from "@/lib/legal-content";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Card, CardContent } from "@/components/ui/card";

export function LegalPage({
  title,
  path,
  version,
  effectiveDate,
  sections
}: {
  title: string;
  path: string;
  version: string;
  effectiveDate: string;
  sections: readonly (readonly [string, string])[];
}) {
  return (
    <PublicPage narrow>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: title, path }])} />
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Business Sorted</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Version {version} · Effective date {effectiveDate}
          </p>
        </div>
        <Card className="border-primary/30">
          <CardContent className="p-4 text-sm text-muted-foreground">{legalNotice}</CardContent>
        </Card>
        <div className="space-y-5">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-lg font-semibold tracking-normal">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
