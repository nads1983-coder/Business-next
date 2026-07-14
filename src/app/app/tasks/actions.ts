"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const taskActionSchema = z.object({
  taskId: z.string().min(1),
  note: z.string().trim().max(1000).optional()
});

async function getOwnedTask(taskId: string, userId: string) {
  const prisma = getPrisma();
  const task = await prisma.task.findFirst({
    where: { id: taskId, business: { userId } },
    include: { business: true }
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  return task;
}

export async function completeTaskAction(formData: FormData) {
  const user = await requireUser();
  const parsed = taskActionSchema.parse({
    taskId: formData.get("taskId"),
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const task = await getOwnedTask(parsed.taskId, user.id);

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completedNote: parsed.note,
      notApplicableAt: null,
      notApplicableReason: null,
      history: {
        create: {
          userId: user.id,
          action: "COMPLETED",
          note: parsed.note
        }
      }
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/tasks");
  revalidatePath(`/app/tasks/${task.id}`);
}

export async function markTaskNotApplicableAction(formData: FormData) {
  const user = await requireUser();
  const parsed = taskActionSchema.parse({
    taskId: formData.get("taskId"),
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const task = await getOwnedTask(parsed.taskId, user.id);

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "NOT_APPLICABLE",
      notApplicableAt: new Date(),
      notApplicableReason: parsed.note,
      completedAt: null,
      completedNote: null,
      history: {
        create: {
          userId: user.id,
          action: "MARKED_NOT_APPLICABLE",
          note: parsed.note
        }
      }
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/tasks");
  revalidatePath(`/app/tasks/${task.id}`);
}

export async function restoreTaskAction(formData: FormData) {
  const user = await requireUser();
  const parsed = taskActionSchema.parse({
    taskId: formData.get("taskId"),
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const task = await getOwnedTask(parsed.taskId, user.id);

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: task.dueDate ? "COMING_UP" : "NEEDS_INFORMATION",
      completedAt: null,
      completedNote: null,
      notApplicableAt: null,
      notApplicableReason: null,
      history: {
        create: {
          userId: user.id,
          action: "RESTORED",
          note: parsed.note
        }
      }
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/tasks");
  revalidatePath(`/app/tasks/${task.id}`);
}
