import Link from "next/link";
import { isAfter } from "date-fns";
import { hashToken } from "@/lib/auth-tokens";
import { getPrisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let title = "This link did not work";
  let message =
    "The confirmation link may have expired or already been used. You can ask for a new one when you sign in.";
  let ok = false;

  if (token) {
    const prisma = getPrisma();
    const hashedToken = hashToken(token);
    const record = await prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });

    if (
      record &&
      record.identifier.startsWith("email-verification:") &&
      isAfter(record.expires, new Date())
    ) {
      const userId = record.identifier.replace("email-verification:", "");
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { emailVerified: new Date() }
        }),
        prisma.verificationToken.delete({
          where: { token: hashedToken }
        })
      ]);
      title = "Email confirmed";
      message = "Your email address is confirmed. You can now sign in.";
      ok = true;
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" variant={ok ? "default" : "outline"}>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
