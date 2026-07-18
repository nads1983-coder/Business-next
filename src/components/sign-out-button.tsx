"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <Button
      className={cn(fullWidth && "w-full justify-start")}
      variant="ghost"
      size="sm"
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}
