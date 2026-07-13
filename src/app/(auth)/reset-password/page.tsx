import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          This link can only be used once. If it has expired, ask for a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This reset link is missing information. Please ask for a new one.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/forgot-password">Ask for a new link</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
