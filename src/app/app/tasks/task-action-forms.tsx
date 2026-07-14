"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, RotateCcw, Slash } from "lucide-react";
import {
  completeTaskAction,
  markTaskNotApplicableAction,
  restoreTaskAction
} from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {icon}
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function TaskActionForms({ taskId, canRestore }: { taskId: string; canRestore: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {canRestore ? (
        <form
          action={restoreTaskAction}
          onSubmit={(event) => {
            if (!window.confirm("Restore this task to your active list?")) event.preventDefault();
          }}
          className="space-y-3 rounded-md border p-4"
        >
          <input type="hidden" name="taskId" value={taskId} />
          <SubmitButton label="Restore task" icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />} />
        </form>
      ) : (
        <>
          <form
            action={completeTaskAction}
            onSubmit={(event) => {
              if (!window.confirm("Mark this task as complete? This will be saved in your history.")) {
                event.preventDefault();
              }
            }}
            className="space-y-3 rounded-md border p-4"
          >
            <input type="hidden" name="taskId" value={taskId} />
            <Label htmlFor="complete-note">Private completion note</Label>
            <Textarea id="complete-note" name="note" placeholder="Optional" />
            <SubmitButton label="Mark complete" icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
          </form>
          <form
            action={markTaskNotApplicableAction}
            onSubmit={(event) => {
              if (!window.confirm("Mark this task as not applicable? You can restore it later.")) {
                event.preventDefault();
              }
            }}
            className="space-y-3 rounded-md border p-4"
          >
            <input type="hidden" name="taskId" value={taskId} />
            <Label htmlFor="not-applicable-note">Reason</Label>
            <Textarea id="not-applicable-note" name="note" placeholder="Optional" />
            <SubmitButton label="Not applicable" icon={<Slash className="h-4 w-4" aria-hidden="true" />} />
          </form>
        </>
      )}
    </div>
  );
}
