import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { billingConfig } from "@/config/billing";
import { productConfig } from "@/config/product";
import { analyticsEvents, recordAnalyticsEvent } from "@/lib/analytics";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  recordAnalyticsEvent({
    name: analyticsEvents.pricingPageViewed,
    path: "/pricing"
  }).catch(() => undefined);

  return (
    <PublicPage>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <Badge variant="calm">Pricing</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Start with calm, plain-English business deadlines.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            {productConfig.promise} Business Next is built for first-time UK founders who want a clear next step,
            not a pile of jargon.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Personalised deadlines",
              "Official source links",
              "Task detail pages",
              "Business settings and recalculation"
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>{billingConfig.plan.name}</CardTitle>
            <CardDescription>{billingConfig.plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-3xl font-semibold">{billingConfig.plan.displayPrice}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {billingConfig.plan.checkoutEnabled ? "Monthly billing" : "Paid Checkout is not available yet"}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {billingConfig.plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{billingConfig.plan.cancellationWording}</p>
            {billingConfig.plan.checkoutEnabled ? (
              <Button asChild className="w-full">
                <Link href="/app/billing">
                  Continue to billing <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <div className="rounded-md border bg-secondary/50 p-4 text-sm text-muted-foreground">
                {billingConfig.plan.comingSoonWording}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          ["Is Business Next accounting advice?", productConfig.disclaimer],
          ["Is Business Next connected to GOV.UK or HMRC?", "No. Business Next links to official sources where useful, but it is an independent product and is not affiliated with government."],
          ["Will it guarantee I avoid penalties?", "No. It helps you organise deadlines and tasks, but you are still responsible for checking your duties and getting professional advice when needed."],
          ["Can I cancel?", "When paid billing is live, cancellation will be handled through the secure billing portal and explained before purchase."]
        ].map(([question, answer]) => (
          <Card key={question}>
            <CardHeader>
              <CardTitle className="text-base">{question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{answer}</CardContent>
          </Card>
        ))}
      </section>

      <nav className="mt-8 flex flex-wrap gap-4 text-sm text-primary underline">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/subscription-terms">Subscription terms</Link>
        <Link href="/refunds">Refund policy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/support">Support</Link>
      </nav>
    </PublicPage>
  );
}
