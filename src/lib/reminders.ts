import { createHash } from "crypto";
import type { BusinessProfile, ReminderDelivery, ReminderInterval, Task, TaskHistory, TaskUrgency } from "@prisma/client";
import { differenceInCalendarDays, format } from "date-fns";
import { sendDeadlineReminderEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { parseUkDate } from "@/lib/task-engine";

const reminderRuleVersion = "deadline-reminders-2026-07-18";
const reminderChannel = "email";

type ReminderPreference = "standard" | "reduced" | "critical";
type ReminderStage = "early_preparation" | "approaching" | "urgent" | "tomorrow" | "due_today" | `overdue_week_${number}`;

type ReminderRule = {
  stage: ReminderStage;
  interval: ReminderInterval;
  reason: string;
  allowedPreferences: ReminderPreference[];
  minimumUrgency?: TaskUrgency;
};

type ReminderDecision =
  | {
      send: true;
      interval: ReminderInterval;
      stage: ReminderStage;
      dedupeKey: string;
      reason: string;
      daysRemainingText: string;
      dueDate: Date;
      ruleVersion: string;
    }
  | { send: false; reason: string };

const upcomingRules = new Map<number, ReminderRule>([
  [
    30,
    {
      stage: "early_preparation",
      interval: "THIRTY_DAYS",
      reason: "the deadline is 30 days away and this is the early preparation reminder",
      allowedPreferences: ["standard"]
    }
  ],
  [
    14,
    {
      stage: "approaching",
      interval: "FOURTEEN_DAYS",
      reason: "the deadline is 14 days away and this is the approaching-deadline reminder",
      allowedPreferences: ["standard"]
    }
  ],
  [
    7,
    {
      stage: "urgent",
      interval: "SEVEN_DAYS",
      reason: "the deadline is 7 days away and this is the urgent reminder",
      allowedPreferences: ["standard", "reduced"]
    }
  ],
  [
    1,
    {
      stage: "tomorrow",
      interval: "ONE_DAY",
      reason: "the deadline is tomorrow",
      allowedPreferences: ["standard", "reduced"]
    }
  ],
  [
    0,
    {
      stage: "due_today",
      interval: "DUE_TODAY",
      reason: "the deadline is due today",
      allowedPreferences: ["standard", "reduced", "critical"]
    }
  ]
]);

function normaliseReminderPreference(value: string | null | undefined): ReminderPreference {
  return value === "reduced" || value === "critical" ? value : "standard";
}

export function reminderIntervalFor(dueDate: Date, today = new Date()): ReminderInterval | null {
  const days = differenceInCalendarDays(parseUkDate(dueDate) ?? dueDate, parseUkDate(today) ?? today);
  if (upcomingRules.has(days)) return upcomingRules.get(days)?.interval ?? null;
  if (days < 0 && Math.abs(days) % 7 === 0) return "OVERDUE";
  return null;
}

function daysRemainingText(days: number) {
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days > 1) return `due in ${days} days`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}

function hourInTimezone(date: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    return Number.isFinite(hour) ? hour : date.getUTCHours();
  } catch {
    return date.getUTCHours();
  }
}

function overdueRule(days: number, preference: ReminderPreference): ReminderRule | null {
  if (days >= 0) return null;
  const overdueDays = Math.abs(days);
  if (overdueDays % 7 !== 0) return null;
  if (preference === "reduced" && overdueDays % 14 !== 0) return null;

  return {
    stage: `overdue_week_${Math.floor(overdueDays / 7)}`,
    interval: "OVERDUE",
    reason: `the deadline is ${overdueDays} days overdue`,
    allowedPreferences: ["standard", "reduced", "critical"]
  };
}

function urgencyAllows(rule: ReminderRule, urgency: TaskUrgency) {
  if (!rule.minimumUrgency) return true;
  return urgency === rule.minimumUrgency;
}

function reminderHash(parts: Record<string, string | number | null>) {
  return createHash("sha256")
    .update(JSON.stringify(Object.keys(parts).sort().map((key) => [key, parts[key]])))
    .digest("hex");
}

function recentRecalculationReason(history: TaskHistory[]) {
  const recalculation = history.find((item) => item.action === "RECALCULATED");
  return recalculation
    ? ` The task was last recalculated on ${format(recalculation.createdAt, "d MMMM yyyy")}.`
    : "";
}

export function reminderDecisionForTask({
  task,
  profile,
  today = new Date()
}: {
  task: Pick<Task, "id" | "businessId" | "key" | "dueDate" | "status" | "urgency" | "missingInformation"> & {
    history: TaskHistory[];
  };
  profile: Pick<
    BusinessProfile,
    "wantsEmailReminders" | "reminderPreference" | "reminderSnoozedUntil" | "reminderPreferredHour" | "reminderTimezone"
  > | null;
  today?: Date;
}): ReminderDecision {
  if (!profile?.wantsEmailReminders) return { send: false, reason: "business_email_reminders_disabled" };
  if (!task.dueDate || Number.isNaN(task.dueDate.getTime())) return { send: false, reason: "invalid_due_date" };
  if (task.status === "COMPLETED") return { send: false, reason: "task_completed" };
  if (task.status === "NOT_APPLICABLE") return { send: false, reason: "task_not_applicable" };
  if (task.missingInformation.length) return { send: false, reason: "task_missing_required_information" };
  if (profile.reminderSnoozedUntil && profile.reminderSnoozedUntil > today) return { send: false, reason: "reminders_snoozed" };

  const preferredHour = Math.min(Math.max(profile.reminderPreferredHour ?? 9, 0), 23);
  if (hourInTimezone(today, profile.reminderTimezone || "Europe/London") < preferredHour) {
    return { send: false, reason: "before_preferred_reminder_hour" };
  }

  const dueDate = parseUkDate(task.dueDate) ?? task.dueDate;
  const dayCount = differenceInCalendarDays(dueDate, parseUkDate(today) ?? today);
  const preference = normaliseReminderPreference(profile.reminderPreference);
  const rule = upcomingRules.get(dayCount) ?? overdueRule(dayCount, preference);
  if (!rule) return { send: false, reason: "outside_reminder_cadence" };
  if (!rule.allowedPreferences.includes(preference)) return { send: false, reason: "reduced_frequency_preference" };
  if (preference === "critical" && task.urgency !== "HIGH" && dayCount >= 0) {
    return { send: false, reason: "critical_only_preference" };
  }
  if (!urgencyAllows(rule, task.urgency)) return { send: false, reason: "below_urgency_threshold" };

  const dueIso = dueDate.toISOString().slice(0, 10);
  const dedupeKey = reminderHash({
    businessId: task.businessId,
    taskId: task.id,
    taskKey: task.key,
    interval: rule.interval,
    stage: rule.stage,
    dueDate: dueIso,
    channel: reminderChannel,
    ruleVersion: reminderRuleVersion
  });

  return {
    send: true,
    interval: rule.interval,
    stage: rule.stage,
    dedupeKey,
    reason: `${rule.reason}.${recentRecalculationReason(task.history)}`,
    daysRemainingText: daysRemainingText(dayCount),
    dueDate,
    ruleVersion: reminderRuleVersion
  };
}

function deliveryAlreadyBlocks(deliveries: ReminderDelivery[], decision: Extract<ReminderDecision, { send: true }>, today: Date) {
  const matching = deliveries.find((delivery) => delivery.dedupeKey === decision.dedupeKey);
  if (!matching) {
    return deliveries.some((delivery) => !delivery.dedupeKey && delivery.interval === decision.interval);
  }
  if (matching.status === "sent") return true;
  if (matching.status === "failed") {
    const hoursSinceFailure = (today.getTime() - matching.sentAt.getTime()) / 36e5;
    return hoursSinceFailure < 12;
  }
  return false;
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "unknown_error";
  return message.slice(0, 240);
}

export async function runDeadlineReminders({
  today = new Date(),
  dryRun = false
}: {
  today?: Date;
  dryRun?: boolean;
}) {
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      dueDate: { not: null },
      status: { in: ["DUE_SOON", "COMING_UP", "OVERDUE"] },
      business: {
        user: {
          consentEmailReminders: true,
          OR: [
            { role: "ADMIN" },
            {
              entitlements: {
                some: {
                  status: "ACTIVE",
                  kind: { in: ["FOUNDER", "COMPLIMENTARY", "TRIAL", "PAID"] },
                  OR: [{ endsAt: null }, { endsAt: { gt: today } }]
                }
              }
            },
            {
              subscriptions: {
                some: { billingStatus: { in: ["ACTIVE", "TRIALING"] } }
              }
            }
          ]
        }
      }
    },
    include: {
      reminderDeliveries: true,
      history: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      business: {
        include: {
          user: true,
          profile: true
        }
      }
    }
  });

  let eligible = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const testEmail = process.env.BUSINESS_NEXT_TEST_EMAIL;

  for (const task of tasks) {
    const decision = reminderDecisionForTask({ task, profile: task.business.profile, today });
    if (!decision.send) {
      skipped += 1;
      continue;
    }

    eligible += 1;
    if (deliveryAlreadyBlocks(task.reminderDeliveries, decision, today)) {
      skipped += 1;
      continue;
    }

    const targetEmail = testEmail || task.business.user.email;
    if (!targetEmail) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      try {
        await sendDeadlineReminderEmail({
          email: targetEmail,
          taskTitle: task.title,
          businessName: task.business.name,
          dueDate: format(decision.dueDate, "d MMMM yyyy"),
          timeRemaining: decision.daysRemainingText,
          nextAction: task.nextAction,
          reason: decision.reason,
          preparationSteps: task.whatYouNeed.length ? task.whatYouNeed : task.checklist,
          taskId: task.id,
          idempotencyKey: `deadline-${decision.dedupeKey}`
        });
        await prisma.reminderDelivery.upsert({
          where: { dedupeKey: decision.dedupeKey },
          create: {
            taskId: task.id,
            interval: decision.interval,
            stage: decision.stage,
            channel: reminderChannel,
            dedupeKey: decision.dedupeKey,
            ruleVersion: decision.ruleVersion,
            dueDate: decision.dueDate,
            reason: decision.reason,
            status: "sent",
            sentTo: targetEmail
          },
          update: {
            status: "sent",
            error: null,
            sentTo: targetEmail,
            sentAt: new Date()
          }
        });
      } catch (error) {
        failed += 1;
        await prisma.reminderDelivery.upsert({
          where: { dedupeKey: decision.dedupeKey },
          create: {
            taskId: task.id,
            interval: decision.interval,
            stage: decision.stage,
            channel: reminderChannel,
            dedupeKey: decision.dedupeKey,
            ruleVersion: decision.ruleVersion,
            dueDate: decision.dueDate,
            reason: decision.reason,
            status: "failed",
            error: safeError(error),
            sentTo: targetEmail
          },
          update: {
            status: "failed",
            error: safeError(error),
            sentTo: targetEmail,
            sentAt: new Date()
          }
        });
        continue;
      }
    }
    sent += 1;
  }

  return { eligible, sent, skipped, failed, dryRun, testMode: Boolean(testEmail), ruleVersion: reminderRuleVersion };
}
