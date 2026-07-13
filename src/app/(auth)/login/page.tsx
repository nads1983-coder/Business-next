import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to see what needs doing next.</CardDescription>
      </CardHeader>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
