import { BusinessSettingsForm } from "./business-settings-form";
import { productConfig } from "@/config/product";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompaniesHouseLookup } from "@/components/companies-house-lookup";

export default async function SettingsPage() {
  const { user } = await requireProductAccess();
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { profile: true }
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
          <CompaniesHouseLookup
            businessId={business.id}
            initialCompanyNumber={business.profile.companyNumber}
            connectedAt={business.profile.companiesHouseConnectedAt}
            lastSyncedAt={business.profile.companiesHouseLastSyncedAt}
          />
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
