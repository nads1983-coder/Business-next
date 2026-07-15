"use client";

import { useActionState } from "react";
import type { BusinessProfile } from "@prisma/client";
import { Save } from "lucide-react";
import { updateBusinessSettingsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function BusinessSettingsForm({
  businessId,
  profile
}: {
  businessId: string;
  profile: BusinessProfile;
}) {
  const [state, formAction] = useActionState(updateBusinessSettingsAction, null);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Save these business details and recalculate your active deadlines? Completed and not-applicable history will be kept.")) {
          event.preventDefault();
        }
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="businessId" value={businessId} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="legalBusinessName">Legal business name</Label>
          <Input id="legalBusinessName" name="legalBusinessName" defaultValue={profile.legalBusinessName ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tradingName">Trading name</Label>
          <Input id="tradingName" name="tradingName" defaultValue={profile.tradingName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyNumber">Company number</Label>
          <Input id="companyNumber" name="companyNumber" defaultValue={profile.companyNumber ?? ""} maxLength={8} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyRegisteredOn">Incorporation date</Label>
          <Input id="companyRegisteredOn" name="companyRegisteredOn" type="date" defaultValue={dateValue(profile.companyRegisteredOn)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startedTradingOn">Date trading started</Label>
          <Input id="startedTradingOn" name="startedTradingOn" type="date" defaultValue={dateValue(profile.startedTradingOn)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstAccountingPeriodEnd">First accounting period end</Label>
          <Input id="firstAccountingPeriodEnd" name="firstAccountingPeriodEnd" type="date" defaultValue={dateValue(profile.firstAccountingPeriodEnd)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessYearEndMonth">Business year-end month</Label>
          <select
            id="businessYearEndMonth"
            name="businessYearEndMonth"
            defaultValue={profile.businessYearEndMonth ?? ""}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Not sure</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option value={index + 1} key={index + 1}>
                {new Date(2026, index, 1).toLocaleString("en-GB", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="registeredForVat">VAT registration status</Label>
          <select id="registeredForVat" name="registeredForVat" defaultValue={profile.registeredForVat} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="YES">Registered</option>
            <option value="NO">Not registered</option>
            <option value="NOT_SURE">Not sure</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatRegisteredOn">VAT registration date</Label>
          <Input id="vatRegisteredOn" name="vatRegisteredOn" type="date" defaultValue={dateValue(profile.vatRegisteredOn)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatPeriodEndsOn">VAT accounting period end</Label>
          <Input id="vatPeriodEndsOn" name="vatPeriodEndsOn" type="date" defaultValue={dateValue(profile.vatPeriodEndsOn)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employsPeople">PAYE or employer status</Label>
          <select id="employsPeople" name="employsPeople" defaultValue={profile.employsPeople} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="YES">Employs people or runs payroll</option>
            <option value="NO">No</option>
            <option value="NOT_SURE">Not sure</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstPayday">First payday</Label>
          <Input id="firstPayday" name="firstPayday" type="date" defaultValue={dateValue(profile.firstPayday)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wantsEmailReminders">Deadline reminder emails</Label>
          <select id="wantsEmailReminders" name="wantsEmailReminders" defaultValue={profile.wantsEmailReminders ? "YES" : "NO"} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="YES">On</option>
            <option value="NO">Off</option>
          </select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Changing dates can move active deadlines. Business Sorted keeps completed and not-applicable history.
      </p>
      {state?.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{state.message}</p>
      ) : null}
      <Button type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save and recalculate
      </Button>
    </form>
  );
}
