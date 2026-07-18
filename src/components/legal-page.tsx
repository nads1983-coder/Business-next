import { legalNotice } from "@/lib/legal-content";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Card, CardContent } from "@/components/ui/card";

type LegalSection = readonly [string, string | readonly string[]];

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
  sections: readonly LegalSection[];
}) {
  return (
    <PublicPage narrow>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: title, path }])} />
      <div className="space-y-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Business Sorted</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal break-words">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground break-words">
            Version {version} — Effective {effectiveDate}
          </p>
        </div>
        {legalNotice ? (
          <Card className="border-primary/30">
            <CardContent className="p-4 text-sm text-muted-foreground">{legalNotice}</CardContent>
          </Card>
        ) : null}
        <div className="space-y-5">
          {sections.map(([heading, body]) => (
            <section key={heading} className="min-w-0">
              <h2 className="text-lg font-semibold tracking-normal break-words">{heading}</h2>
              {Array.isArray(body) ? (
                <div className="mt-2 space-y-3">
                  {body.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-7 text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-base leading-7 text-muted-foreground break-words [overflow-wrap:anywhere]">{body}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
