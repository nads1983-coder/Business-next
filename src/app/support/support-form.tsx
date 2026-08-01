"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EnquiryActionState } from "@/lib/support-enquiries";
import { submitSupportEnquiryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: EnquiryActionState | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send enquiry"}
    </Button>
  );
}

export function SupportForm() {
  const [state, formAction] = useActionState(submitSupportEnquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="source" value="/support" />
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="support-name">Your name</Label>
          <Input id="support-name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-email">Email address</Label>
          <Input id="support-email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="support-telephone">Telephone number</Label>
          <Input id="support-telephone" name="telephone" type="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-company">Company or business name</Label>
          <Input id="support-company" name="companyName" autoComplete="organization" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-category">Enquiry category</Label>
        <select
          id="support-category"
          name="category"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a category
          </option>
          <option value="account">Account support</option>
          <option value="billing">Billing or subscription</option>
          <option value="product">Product question</option>
          <option value="technical">Technical issue</option>
          <option value="other">Other enquiry</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-message">Message</Label>
        <Textarea
          id="support-message"
          name="message"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
        />
      </div>
      {state?.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
