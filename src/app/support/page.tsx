import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { productConfig } from "@/config/product";
import { PublicPage } from "@/components/public-page";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Business Sorted support",
  description: "Contact Business Sorted for account, billing or product support.",
  path: "/support"
});

export default function SupportPage() {
  const mailtoHref =
    "mailto:support@businesssorted.uk?subject=Business%20Sorted%20support%20request";

  return (
    <PublicPage narrow>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Support", path: "/support" }])} />
      <div className="space-y-8">
        <section className="space-y-4">
          <p className="text-sm font-medium text-primary">Business Sorted support</p>
          <h1 className="text-3xl font-semibold tracking-normal">Contact support</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Email Business Sorted for account, billing or product support. Please do not send card details,
            passwords, authentication codes or private tax documents.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href={mailtoHref}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email support@businesssorted.uk
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/billing">Open billing page</Link>
            </Button>
          </div>
        </section>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              What to include
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Include the email address on your Business Sorted account, the page or task you need help with,
              and a short description of what happened.
            </p>
            <p>
              For billing questions, include the date of the payment or invoice if you have it. Card details
              stay with Stripe and should not be sent by email.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account deletion</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Account deletion is support-led so any active subscription can be handled safely before
              irreversible data changes are made.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who operates Business Sorted</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {productConfig.tradingNameDisclosure}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicPage>
  );
}
