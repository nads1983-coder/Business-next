import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getProductAccess } from "@/lib/billing";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingSuccessPage() {
  const user = await requireUser();
  const access = await getProductAccess(user.id);

  return (
    <div className="space-y-6">
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            Checkout received
          </CardTitle>
          <CardDescription>
            Stripe has redirected you back to Business Next. Product access is updated only after a verified Stripe webhook is processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{access.message}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/app/billing">View billing</Link>
            </Button>
            {access.allowed ? (
              <Button asChild variant="secondary">
                <Link href="/app">Go to dashboard</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
