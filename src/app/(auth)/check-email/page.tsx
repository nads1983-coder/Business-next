import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CheckEmailPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const isReset = params.type === "reset";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isReset ? "Check your email" : "Confirm your email"}</CardTitle>
        <CardDescription>
          {isReset
            ? "If an account uses that email address, a reset link is on its way."
            : "We sent a confirmation link. Open it to finish setting up your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>The link will only work for a short time. This helps keep your account safe.</p>
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
