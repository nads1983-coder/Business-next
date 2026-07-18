import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck, Target } from "lucide-react";
import { daysUntilText, taskDisplayBucket } from "@/lib/task-engine";
import { plainCopy } from "@/content/plain-copy";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const bucketOrder = ["Needs attention", "Coming up", "Completed", "Not applicable"];
const bucketCopy: Record<string, { description: string; empty: string; icon: typeof Target }> = {
  "Needs attention": {
    description: "Start here when you have a few minutes.",
    empty: "Nothing urgent needs your attention right now.",
    icon: Target
  },
  "Coming up": {
    description: "Useful to know soon, without needing to act today.",
    empty: "No upcoming deadlines are waiting yet.",
    icon: Clock
  },
  Completed: {
    description: "Your saved completion history.",
    empty: "Completed tasks will appear here after you mark them done.",
    icon: CheckCircle2
  },
  "Not applicable": {
    description: "Tasks you have safely moved out of the active list.",
    empty: "Tasks marked not applicable will appear here and can be restored.",
    icon: ShieldCheck
  }
};

export default async function TasksPage() {
  const { user } = await requireProductAccess();
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
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
        <h1 className="text-3xl font-semibold tracking-normal">My tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Personalised business deadlines with the plain-English reason for each one.
        </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/app/settings">Update details</Link>
        </Button>
      </div>
      {tasks.length ? (
        bucketOrder.map((bucket) => (
          <section key={bucket} className="space-y-3">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = bucketCopy[bucket].icon;
                return <Icon className="h-5 w-5 text-primary" aria-hidden="true" />;
              })()}
              <div>
                <h2 className="text-xl font-semibold tracking-normal">{bucket}</h2>
                <p className="text-sm text-muted-foreground">{bucketCopy[bucket].description}</p>
              </div>
            </div>
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
                  {bucketCopy[bucket].empty}
                </CardContent>
              </Card>
            )}
          </section>
        ))
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="font-medium">Your deadline list is ready to be built.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {plainCopy.emptyTasks} Add or check your business details so Business Sorted can calculate your first tasks.
              </p>
            </div>
            <Button asChild>
              <Link href="/app/settings">Check business details</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
