"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">Use at least 8 characters. You can reset it any time.</p>
      </div>
      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}
      <p className="text-xs text-muted-foreground">
        Next: a short setup flow that creates your deadline list. You can change the answers later.
      </p>
      <SubmitButton />
    </form>
  );
}
