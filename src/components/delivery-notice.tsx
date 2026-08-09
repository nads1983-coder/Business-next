"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

const messages = {
  missing: "Complete checkout to access the paid pack.",
  invalid: "We could not verify that checkout session. Please use the Stripe checkout link again.",
  unpaid: "That checkout has not completed successfully yet.",
  "wrong-pack": "That checkout was for a different pack. Please choose the correct pack below."
} as const;

function DeliveryNoticeContent() {
  const searchParams = useSearchParams();
  const delivery = searchParams.get("delivery");
  const message = delivery && delivery in messages ? messages[delivery as keyof typeof messages] : null;

  if (!message) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-md border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
      <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function DeliveryNotice() {
  return (
    <Suspense fallback={null}>
      <DeliveryNoticeContent />
    </Suspense>
  );
}
