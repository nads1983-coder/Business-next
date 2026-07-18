import Link from "next/link";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { billingConfig, getCheckoutGateDiagnostics, isControlledBillingTestUser } from "@/config/billing";
import { productConfig } from "@/config/product";
import { getProductAccess } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { openBillingPortalAction, startCheckoutAction } from "./actions";

function dateText(date?: Date | null) {
  return date ? format(date, "d MMMM yyyy") : "Not set";
}

const diagnosticLabels = {
  billing_enabled: "Billing enabled",
  owner_email: "Approved owner email",
  legal_owner: "Owner legal approval",
  legal_versions: "Accepted legal versions",
  stripe_mode: "Live Stripe mode",
  stripe_secret: "Stripe secret key",
  stripe_webhook: "Stripe webhook secret",
  stripe_product: "Stripe product",
  stripe_price: "Live monthly price",
  approved_app_url: "Approved app URL",
  vercel_environment: "Production Vercel environment",
  mode_isolation: "Stripe mode isolation"
} as const;

export default async function BillingPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const [access, subscription] = await Promise.all([
    getProductAccess(user.id),
    prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const hasStripeCustomer = Boolean(subscription?.stripeCustomerId);
  const canStartControlledCheckout = billingConfig.plan.checkoutEnabled && isControlledBillingTestUser(user.email);
  const checkoutGate = getCheckoutGateDiagnostics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Billing</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Manage your Business Sorted access, subscription and cancellation options.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {productConfig.tradingNameDisclosure}
        </p>
      </div>

      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Current access</CardTitle>
              <CardDescription>{access.message}</CardDescription>
            </div>
            <Badge variant={access.allowed ? "calm" : "outline"}>{access.source}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium">Plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">{billingConfig.plan.name}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Subscription status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription?.billingStatus.replaceAll("_", " ").toLowerCase() ?? "No paid subscription"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Billing interval</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription?.billingInterval.toLowerCase() ?? "None"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Next renewal or access review</h2>
            <p className="mt-1 text-sm text-muted-foreground">{dateText(subscription?.currentPeriodEnd)}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Trial end</h2>
            <p className="mt-1 text-sm text-muted-foreground">{dateText(subscription?.trialEnd)}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Cancellation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription?.cancelAtPeriodEnd
                ? `Cancellation is scheduled for ${dateText(subscription.currentPeriodEnd)}.`
                : "No cancellation is scheduled."}
            </p>
          </div>
        </CardContent>
      </Card>

      {!canStartControlledCheckout ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              Paid Checkout is in controlled launch mode
            </CardTitle>
            <CardDescription>
              {billingConfig.plan.checkoutEnabled
                ? "Checkout is configured but limited to the approved owner account until public launch is approved."
                : billingConfig.plan.comingSoonWording}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkoutGate.failingCategories.length ? (
              <div className="mb-4 rounded-md border bg-secondary/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Controlled launch checks still needed</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {checkoutGate.failingCategories.map((category) => (
                    <li key={category}>{diagnosticLabels[category]}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button asChild variant="secondary">
              <Link href="/pricing">View pricing status</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to {billingConfig.plan.name}</CardTitle>
            <CardDescription>
              {billingConfig.plan.displayPrice}. Monthly recurring billing, no annual option and no free trial. You will
              be sent to Stripe Checkout. Access is granted only after Nadine Pierre Ltd receives a verified Stripe webhook for BusinessSorted.uk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={startCheckoutAction} className="space-y-4">
              <input type="hidden" name="interval" value="monthly" />
              <p className="text-sm text-muted-foreground">
                You can cancel at any time. Cancellation stops future renewal payments and normally takes effect at the end of
                the current paid monthly period, with access continuing until then.
              </p>
              <label className="flex min-h-11 items-start gap-3 rounded-md border p-3 text-sm">
                <input className="mt-1 h-4 w-4 shrink-0" type="checkbox" name="acceptTerms" required />
                <span className="min-w-0 leading-6">
                  I accept the Business Sorted{" "}
                  <Link href="/terms" className="text-primary underline">
                    Terms and Conditions
                  </Link>
                  .
                </span>
              </label>
              <label className="flex min-h-11 items-start gap-3 rounded-md border p-3 text-sm">
                <input className="mt-1 h-4 w-4 shrink-0" type="checkbox" name="acceptPrivacy" required />
                <span className="min-w-0 leading-6">
                  I accept the{" "}
                  <Link href="/privacy" className="text-primary underline">
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>
              <label className="flex min-h-11 items-start gap-3 rounded-md border p-3 text-sm">
                <input className="mt-1 h-4 w-4 shrink-0" type="checkbox" name="acceptSubscriptionTerms" required />
                <span className="min-w-0 leading-6">
                  I accept the{" "}
                  <Link href="/subscription-terms" className="text-primary underline">
                    Subscription and Cancellation Terms
                  </Link>
                  , including monthly recurring billing at{" "}
                  {billingConfig.plan.displayPrice}, no annual plan, no free trial, and cancellation taking effect at the end
                  of the current paid monthly period.
                </span>
              </label>
              <Button type="submit" className="w-full sm:w-auto">Continue to Checkout</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            Manage billing
          </CardTitle>
          <CardDescription>{billingConfig.plan.cancellationWording}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasStripeCustomer ? (
            <form action={openBillingPortalAction}>
              <Button type="submit">
                Open secure billing portal <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              There is no Stripe billing profile linked to this account yet.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Account deletion is separate from cancelling payment. For Stage 3, deletion is support-led so we can make sure an
            active subscription is cancelled safely before any account data is removed.
          </p>
          <Button asChild variant="secondary">
            <Link href="/support">Contact support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
