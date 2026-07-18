import { format } from "date-fns";
import { BusinessSettingsForm } from "./business-settings-form";
import { acknowledgeCompaniesHouseChangeAction } from "./actions";
import { productConfig } from "@/config/product";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompaniesHouseLookup } from "@/components/companies-house-lookup";

const companiesHouseChangeLabels: Record<string, string> = {
  companyName: "Company name",
  companyStatus: "Company status",
  registeredOffice: "Registered office address",
  companyType: "Company type",
  sicCodes: "SIC codes",
  accountingReferenceDay: "Accounting reference day",
  accountingReferenceMonth: "Accounting reference month",
  accountsNextDue: "Accounts due date",
  confirmationNextDue: "Confirmation statement due date",
  accountsOverdue: "Accounts overdue indicator",
  confirmationOverdue: "Confirmation statement overdue indicator"
};

function formatCompaniesHouseValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function SettingsPage() {
  const { user } = await requireProductAccess();
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      companiesHouseChanges: {
        where: { acknowledgedAt: null },
        orderBy: { detectedAt: "desc" },
        take: 20
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Review your business details, reminder choices and account information.
        </p>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
            <CardDescription>
              These details are used to calculate deadlines. Save changes only when the details are correct.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {business?.profile ? (
              <BusinessSettingsForm businessId={business.id} profile={business.profile} />
            ) : (
              <p className="text-sm text-muted-foreground">Complete onboarding to create a business profile.</p>
            )}
          </CardContent>
        </Card>
        {business?.profile?.businessType === "LIMITED_COMPANY" ? (
          <>
            {business.companiesHouseChanges.length ? (
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Companies House information updated</CardTitle>
                      <CardDescription>
                        Review what changed before relying on the updated business details.
                      </CardDescription>
                    </div>
                    <Badge variant="calm">Review required</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.companiesHouseChanges.map((change) => (
                    <div key={change.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{companiesHouseChangeLabels[change.field] ?? change.field}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Detected {format(change.detectedAt, "d MMMM yyyy")} from Companies House check at{" "}
                            {format(change.sourceCheckedAt, "HH:mm")}.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {change.affectsDeadlines ? <Badge variant="default">Deadlines recalculated</Badge> : null}
                          <Badge variant="outline">
                            {change.notificationSentAt ? "Notification sent" : "No notification sent"}
                          </Badge>
                        </div>
                      </div>
                      <dl className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium uppercase text-muted-foreground">Previous</dt>
                          <dd className="mt-1 break-words text-sm">{formatCompaniesHouseValue(change.previousValue)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase text-muted-foreground">New</dt>
                          <dd className="mt-1 break-words text-sm">{formatCompaniesHouseValue(change.newValue)}</dd>
                        </div>
                      </dl>
                      <form action={acknowledgeCompaniesHouseChangeAction} className="mt-4">
                        <input type="hidden" name="changeId" value={change.id} />
                        <Button type="submit" variant="outline" size="sm">Acknowledge update</Button>
                      </form>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
            <CompaniesHouseLookup
              businessId={business.id}
              initialCompanyNumber={business.profile.companyNumber}
              connectedAt={business.profile.companiesHouseConnectedAt}
              lastSyncedAt={business.profile.companiesHouseLastSyncedAt}
            />
          </>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your account</CardTitle>
              <CardDescription>Basic account details for signing in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Name: {dbUser?.name ?? "Not set"}</p>
              <p>Email: {dbUser?.email ?? user.email}</p>
              <p>Email checked: {dbUser?.emailVerified ? "Yes" : "Pending"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trust note</CardTitle>
              <CardDescription>What Business Sorted can and cannot do.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{productConfig.disclaimer}</p>
              <p>Business Sorted does not file, submit or pay anything for you.</p>
              <p>Check the linked official source or speak to a qualified professional when unsure.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
