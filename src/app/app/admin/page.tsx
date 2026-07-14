import { format } from "date-fns";
import { RuleContentForm } from "./rule-content-form";
import { requireAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const [
    rules,
    totalUsers,
    founderAccess,
    activeSubscriptions,
    trials,
    cancellationScheduled,
    paymentAttention,
    endedSubscriptions,
    recentBillingEvents,
    webhookFailures
  ] = await Promise.all([
    prisma.complianceRule.findMany({
      orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }],
      include: {
        contentVersions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { changedBy: { select: { email: true } } }
        }
      }
    }),
    prisma.user.count(),
    prisma.userEntitlement.count({ where: { kind: { in: ["FOUNDER", "COMPLIMENTARY"] }, status: "ACTIVE" } }),
    prisma.subscription.count({ where: { billingStatus: "ACTIVE" } }),
    prisma.subscription.count({ where: { billingStatus: "TRIALING" } }),
    prisma.subscription.count({ where: { cancelAtPeriodEnd: true } }),
    prisma.subscription.count({ where: { billingStatus: { in: ["PAST_DUE", "INCOMPLETE", "UNPAID"] } } }),
    prisma.subscription.count({ where: { billingStatus: { in: ["CANCELED", "INCOMPLETE_EXPIRED"] } } }),
    prisma.billingEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true } } }
    }),
    prisma.stripeWebhookEvent.count({ where: { processingStatus: "failed" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Admin content</h1>
        <p className="mt-2 text-muted-foreground">
          Update explanatory content and source metadata. Deadline calculation logic changes require a code and rule-version update.
        </p>
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Customer access overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Billing state is driven by verified Stripe events or explicit founder access.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Registered users", totalUsers],
            ["Founder or complimentary", founderAccess],
            ["Active paid subscriptions", activeSubscriptions],
            ["Trials", trials],
            ["Cancellation scheduled", cancellationScheduled],
            ["Payment attention required", paymentAttention],
            ["Ended subscriptions", endedSubscriptions],
            ["Webhook failures", webhookFailures]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent billing events</CardTitle>
            <CardDescription>No card data or secrets are shown here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBillingEvents.length ? (
              recentBillingEvents.map((event) => (
                <div key={event.id} className="rounded-md border p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{event.type}</p>
                  <p>{event.summary}</p>
                  <p>{format(event.createdAt, "d MMMM yyyy HH:mm")} · user {event.user?.id.slice(0, 8) ?? "unknown"}</p>
                  {event.stripeCustomerId ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${event.stripeCustomerId}`}
                      className="text-primary underline"
                    >
                      Open Stripe customer
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No billing events yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <CardTitle>{rule.key}</CardTitle>
              <CardDescription>
                Version from {format(rule.effectiveFrom, "d MMMM yyyy")} · {rule.reviewStatus}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RuleContentForm rule={rule} />
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Recent content history</h2>
                {rule.contentVersions.length ? (
                  rule.contentVersions.map((version) => (
                    <div key={version.id} className="rounded-md border p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{version.plainName}</p>
                      <p>{format(version.createdAt, "d MMMM yyyy HH:mm")} by {version.changedBy?.email ?? "unknown"}</p>
                      {version.changeNote ? <p>{version.changeNote}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No content changes yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
