"use client";

import { useActionState } from "react";
import type { ComplianceRule } from "@prisma/client";
import { Save } from "lucide-react";
import { updateRuleContentAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RuleContentForm({ rule }: { rule: ComplianceRule }) {
  const [state, formAction] = useActionState(updateRuleContentAction, null);

  return (
    <form action={formAction} className="space-y-3 rounded-md border p-4">
      <input type="hidden" name="ruleId" value={rule.id} />
      <div className="space-y-2">
        <Label htmlFor={`plainName-${rule.id}`}>Plain-English name</Label>
        <Input id={`plainName-${rule.id}`} name="plainName" defaultValue={rule.plainName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`description-${rule.id}`}>Explanation</Label>
        <Textarea id={`description-${rule.id}`} name="description" defaultValue={rule.description} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`sourceUrl-${rule.id}`}>Official source URL</Label>
          <Input id={`sourceUrl-${rule.id}`} name="sourceUrl" defaultValue={rule.sourceUrl} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`checkedAt-${rule.id}`}>Last checked</Label>
          <Input id={`checkedAt-${rule.id}`} name="checkedAt" type="date" defaultValue={rule.checkedAt.toISOString().slice(0, 10)} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`active-${rule.id}`}>Content status</Label>
          <select id={`active-${rule.id}`} name="active" defaultValue={rule.reviewStatus === "RETIRED" ? "NO" : "YES"} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="YES">Active</option>
            <option value="NO">Inactive</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`changeNote-${rule.id}`}>Change note</Label>
          <Input id={`changeNote-${rule.id}`} name="changeNote" />
        </div>
      </div>
      {state?.message ? <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{state.message}</p> : null}
      <Button type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save explanation
      </Button>
    </form>
  );
}
