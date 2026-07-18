import { describe, expect, it } from "vitest";
import type { BusinessProfile, Task, TaskHistory } from "@prisma/client";
import { reminderDecisionForTask, reminderIntervalFor } from "./reminders";

const profile = {
  wantsEmailReminders: true,
  reminderPreference: "standard",
  reminderSnoozedUntil: null,
  reminderPreferredHour: 9,
  reminderTimezone: "Europe/London"
} as Pick<BusinessProfile, "wantsEmailReminders" | "reminderPreference" | "reminderSnoozedUntil" | "reminderPreferredHour" | "reminderTimezone">;

function task(overrides: Partial<Task> & { history?: TaskHistory[] } = {}) {
  return {
    id: "task-1",
    businessId: "business-1",
    key: "limited-company-confirmation-statement",
    dueDate: new Date("2026-08-13T00:00:00.000Z"),
    status: "COMING_UP",
    urgency: "NORMAL",
    missingInformation: [],
    history: [],
    ...overrides
  } as Pick<Task, "id" | "businessId" | "key" | "dueDate" | "status" | "urgency" | "missingInformation"> & {
    history: TaskHistory[];
  };
}

describe("smarter deadline reminders", () => {
  it("keeps the public interval helper compatible with the configured stages", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");

    expect(reminderIntervalFor(new Date("2026-08-13T00:00:00.000Z"), today)).toBe("THIRTY_DAYS");
    expect(reminderIntervalFor(new Date("2026-07-21T00:00:00.000Z"), today)).toBe("SEVEN_DAYS");
    expect(reminderIntervalFor(new Date("2026-07-14T00:00:00.000Z"), today)).toBe("DUE_TODAY");
    expect(reminderIntervalFor(new Date("2026-07-07T00:00:00.000Z"), today)).toBe("OVERDUE");
  });

  it("builds deterministic reminder keys from task, deadline, channel, stage and rule version", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");
    const first = reminderDecisionForTask({ task: task(), profile, today });
    const second = reminderDecisionForTask({ task: task({ title: "Changed unrelated title" } as Partial<Task>), profile, today });

    expect(first).toMatchObject({ send: true, interval: "THIRTY_DAYS", stage: "early_preparation" });
    expect(second).toMatchObject({ send: true });
    if (first.send && second.send) expect(first.dedupeKey).toBe(second.dedupeKey);
  });

  it("starts a new reminder series when the deadline changes", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");
    const original = reminderDecisionForTask({ task: task(), profile, today });
    const moved = reminderDecisionForTask({
      task: task({ dueDate: new Date("2026-08-20T00:00:00.000Z") }),
      profile,
      today: new Date("2026-07-21T10:00:00.000Z")
    });

    expect(original).toMatchObject({ send: true });
    expect(moved).toMatchObject({ send: true });
    if (original.send && moved.send) expect(original.dedupeKey).not.toBe(moved.dedupeKey);
  });

  it("honours reduced, critical-only and snooze preferences", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");

    expect(
      reminderDecisionForTask({ task: task(), profile: { ...profile, reminderPreference: "reduced" }, today })
    ).toEqual({ send: false, reason: "reduced_frequency_preference" });

    expect(
      reminderDecisionForTask({
        task: task({ dueDate: new Date("2026-07-14T00:00:00.000Z"), urgency: "NORMAL" }),
        profile: { ...profile, reminderPreference: "critical" },
        today
      })
    ).toEqual({ send: false, reason: "critical_only_preference" });

    expect(
      reminderDecisionForTask({
        task: task(),
        profile: { ...profile, reminderSnoozedUntil: new Date("2026-07-15T00:00:00.000Z") },
        today
      })
    ).toEqual({ send: false, reason: "reminders_snoozed" });
  });
});
