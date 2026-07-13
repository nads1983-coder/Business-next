import { productConfig } from "@/config/product";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account, consent and data choices.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
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
            <CardTitle>Consent and data</CardTitle>
            <CardDescription>Stage 1 includes the account controls shape.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Email reminders: {dbUser?.consentEmailReminders ? "On" : "Off"}</p>
            <p>Data export: available in the account management build step.</p>
            <p>Account deletion: available in the account management build step.</p>
            <p>{productConfig.disclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
