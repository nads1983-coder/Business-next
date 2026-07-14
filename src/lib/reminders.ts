import type { ReminderInterval } from "@prisma/client";
import { differenceInCalendarDays, format } from "date-fns";
import { sendDeadlineReminderEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { parseUkDate } from "@/lib/task-engine";

const intervalByDays = new Map<number, ReminderInterval>([
  [30, "THIRTY_DAYS"],
  [14, "FOURTEEN_DAYS"],
  [7, "SEVEN_DAYS"],
  [1, "ONE_DAY"]
]);

export function reminderIntervalFor(dueDate: Date, today = new Date()): ReminderInterval | null {
  const days = differenceInCalendarDays(parseUkDate(dueDate) ?? dueDate, parseUkDate(today) ?? today);
  if (intervalByDays.has(days)) return intervalByDays.get(days) ?? null;
  if (days < 0 && Math.abs(days) % 7 === 0) return "OVERDUE";
  return null;
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
          consentEmailReminders: true
        }
      }
    },
    include: {
      reminderDeliveries: true,
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
  const testEmail = process.env.BUSINESS_NEXT_TEST_EMAIL;

  for (const task of tasks) {
    if (!task.dueDate || !task.business.profile?.wantsEmailReminders) {
      skipped += 1;
      continue;
    }
    const interval = reminderIntervalFor(task.dueDate, today);
    if (!interval) {
      skipped += 1;
      continue;
    }
    eligible += 1;
    if (task.reminderDeliveries.some((delivery) => delivery.interval === interval)) {
      skipped += 1;
      continue;
    }

    const targetEmail = testEmail || task.business.user.email;
    if (!targetEmail) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      await sendDeadlineReminderEmail({
        email: targetEmail,
        taskTitle: task.title,
        dueDate: format(task.dueDate, "d MMMM yyyy"),
        nextAction: task.nextAction,
        taskId: task.id,
        interval
      });
      await prisma.reminderDelivery.create({
        data: {
          taskId: task.id,
          interval,
          sentTo: targetEmail
        }
      });
    }
    sent += 1;
  }

  return { eligible, sent, skipped, dryRun, testMode: Boolean(testEmail) };
}
