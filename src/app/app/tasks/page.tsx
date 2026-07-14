import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, ExternalLink } from "lucide-react";
import { daysUntilText, taskDisplayBucket } from "@/lib/task-engine";
import { plainCopy } from "@/content/plain-copy";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const bucketOrder = ["Needs attention", "Coming up", "Completed", "Not applicable"];

export default async function TasksPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    include: { tasks: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] } }
  });

  const tasks = business?.tasks ?? [];
  const buckets = new Map<string, typeof tasks>();
  for (const label of bucketOrder) buckets.set(label, []);
  for (const task of tasks) {
    const bucket = taskDisplayBucket(task.status, task.dueDate);
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), task]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">My tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Personalised business deadlines with the plain-English reason for each one.
        </p>
      </div>
      {tasks.length ? (
        bucketOrder.map((bucket) => (
          <section key={bucket} className="space-y-3">
            <h2 className="text-xl font-semibold tracking-normal">{bucket}</h2>
            {(buckets.get(bucket) ?? []).length ? (
              <div className="grid gap-4">
                {(buckets.get(bucket) ?? []).map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle>{task.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {task.plainEnglishSummary}
                          </CardDescription>
                        </div>
                        <Badge variant="calm">{plainCopy.status[task.status]}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <h3 className="text-sm font-medium">Due date</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.dueDate ? format(task.dueDate, "d MMMM yyyy") : "We need more information"}
                        </p>
                        <p className="mt-1 text-sm font-medium">{daysUntilText(task.dueDate)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Next action</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{task.nextAction}</p>
                      </div>
                      <div className="flex flex-col gap-2 md:min-w-44">
                        <Button asChild>
                          <Link href={`/app/tasks/${task.id}`}>
                            Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                        {task.officialSourceUrl ? (
                          <a
                            href={task.officialSourceUrl}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline"
                          >
                            Source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Nothing here right now.
                </CardContent>
              </Card>
            )}
          </section>
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            {plainCopy.emptyTasks}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
