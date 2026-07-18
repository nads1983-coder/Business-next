"use client";

import { useActionState } from "react";
import type { BusinessProfile } from "@prisma/client";
import { Save, ShieldCheck } from "lucide-react";
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
      className="grid gap-5"
    >
      <input type="hidden" name="businessId" value={businessId} />
      <div className="rounded-md border bg-secondary/50 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2 font-medium text-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          Why these details matter
        </p>
        <p className="mt-2">
          Business Sorted uses these answers only to calculate and explain your deadline list. Choose
          “not sure” where available, then come back when you have the detail.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="legalBusinessName">Legal business name</Label>
          <Input id="legalBusinessName" name="legalBusinessName" defaultValue={profile.legalBusinessName ?? ""} required />
          <p className="text-xs text-muted-foreground">Used to label this profile clearly in your account.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tradingName">Trading name</Label>
          <Input id="tradingName" name="tradingName" defaultValue={profile.tradingName ?? ""} />
          <p className="text-xs text-muted-foreground">Optional. Add it only if customers know you by a different name.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyNumber">Company number</Label>
          <Input id="companyNumber" name="companyNumber" defaultValue={profile.companyNumber ?? ""} maxLength={8} />
          <p className="text-xs text-muted-foreground">Helps you cross-check Companies House tasks.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyRegisteredOn">Incorporation date</Label>
          <Input id="companyRegisteredOn" name="companyRegisteredOn" type="date" defaultValue={dateValue(profile.companyRegisteredOn)} />
          <p className="text-xs text-muted-foreground">Used for first accounts and confirmation statement timing.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startedTradingOn">Date trading started</Label>
          <Input id="startedTradingOn" name="startedTradingOn" type="date" defaultValue={dateValue(profile.startedTradingOn)} />
          <p className="text-xs text-muted-foreground">Used for tax-year tasks and registration prompts.</p>
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
          <p className="text-xs text-muted-foreground">Used to calculate VAT return timing when VAT applies.</p>
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
        <div className="space-y-2">
          <Label htmlFor="reminderPreference">Reminder frequency</Label>
          <select
            id="reminderPreference"
            name="reminderPreference"
            defaultValue={profile.reminderPreference}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="standard">Standard</option>
            <option value="reduced">Reduced frequency</option>
            <option value="critical">Critical only</option>
          </select>
          <p className="text-xs text-muted-foreground">Service, security and billing emails are separate from optional reminders.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminderSnoozedUntil">Snooze reminders until</Label>
          <Input id="reminderSnoozedUntil" name="reminderSnoozedUntil" type="date" defaultValue={dateValue(profile.reminderSnoozedUntil)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminderPreferredHour">Preferred reminder hour</Label>
          <Input
            id="reminderPreferredHour"
            name="reminderPreferredHour"
            type="number"
            min={0}
            max={23}
            defaultValue={profile.reminderPreferredHour}
          />
          <p className="text-xs text-muted-foreground">Uses 24-hour time in your business timezone.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminderTimezone">Business timezone</Label>
          <Input id="reminderTimezone" name="reminderTimezone" defaultValue={profile.reminderTimezone} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Changing dates can move active deadlines. Business Sorted keeps completed and not-applicable history, then recalculates only the active list.
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
