import type { Metadata } from "next";
import Link from "next/link";
import { productConfig } from "@/config/product";
import { JsonLd, breadcrumbSchema, organizationSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "About Business Sorted",
  description: "Business Sorted is a plain-English UK business administration and compliance assistant for first-time founders and small-business owners.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <PublicPage narrow>
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])
        ]}
      />
      <section>
        <Badge variant="calm">About</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">About Business Sorted</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Business Sorted is a plain-English UK business administration and compliance assistant for first-time founders, small limited-company owners, directors, freelancers and sole traders.
        </p>
      </section>

      <div className="mt-8 space-y-5">
        {[
          ["What it does", "Business Sorted helps owners understand what needs doing, when it needs doing and what records or source links sit behind each task."],
          ["Who it serves", "It is built for people who are new to running a UK business and want calm, practical reminders for Companies House, HMRC and routine admin."],
          ["How information is sourced", "Guide content uses official UK sources such as GOV.UK, HMRC and Companies House where regulatory facts are involved. Pages show when they were last checked."],
          ["How to use it", "Use Business Sorted to organise general information, deadline reminders and admin checklists. Confirm your own dates in official records and get qualified advice for your circumstances."],
          ["What it does not do", productConfig.disclaimer]
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-8 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-xl font-semibold tracking-normal">Contact</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          For account, product or billing support, email {productConfig.supportEmail} or use the <Link href="/support" className="text-primary underline">support page</Link>.
        </p>
      </section>
    </PublicPage>
  );
}
