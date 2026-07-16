import Link from "next/link";
import { RegisterForm } from "./register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your Business Sorted account</CardTitle>
        <CardDescription>
          Start with your account, then answer a few business questions to see your first deadline list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
