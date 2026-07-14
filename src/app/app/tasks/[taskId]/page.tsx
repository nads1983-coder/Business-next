import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TaskActionForms } from "../task-action-forms";
import { daysUntilText } from "@/lib/task-engine";
import { plainCopy } from "@/content/plain-copy";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const task = await prisma.task.findFirst({
    where: { id: taskId, business: { userId: user.id } },
    include: {
      history: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/app/tasks">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to tasks
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">{task.title}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{task.plainEnglishSummary}</p>
        </div>
        <Badge variant="calm">{plainCopy.status[task.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your deadline</CardTitle>
          <CardDescription>
            {task.dueDate ? `${format(task.dueDate, "d MMMM yyyy")} · ${daysUntilText(task.dueDate)}` : "We need more information before showing a date."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{task.nextAction}</p>
          {task.missingInformation.length ? (
            <div>
              <p className="font-medium text-foreground">Missing information</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {task.missingInformation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button asChild className="mt-3" variant="outline">
                <Link href="/app/settings">Complete business details</Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What this means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{task.whatThisMeans}</p>
            <h2 className="font-medium text-foreground">Why you may need to do it</h2>
            <p>{task.whyYouMayNeedIt}</p>
            <h2 className="font-medium text-foreground">How this date was worked out</h2>
            <p>{task.calculationExplanation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to prepare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              {task.whatYouNeed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2 className="font-medium text-foreground">Step-by-step</h2>
            <ol className="list-decimal space-y-1 pl-5">
              {task.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Official source</CardTitle>
          <CardDescription>
            Last checked {task.sourceCheckedAt ? format(task.sourceCheckedAt, "d MMMM yyyy") : "not recorded"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{task.sourceTitle ?? "Official guidance"}</p>
          {task.officialSourceUrl ? (
            <a href={task.officialSourceUrl} className="inline-flex items-center gap-1 font-medium text-primary underline">
              Open official source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
          <p>{task.adviceBoundary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task actions</CardTitle>
          <CardDescription>These changes are private to your business account.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskActionForms taskId={task.id} canRestore={task.status === "NOT_APPLICABLE"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {task.history.length ? (
            task.history.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="font-medium text-foreground">{plainCopy.history[item.action]}</p>
                <p>{format(item.createdAt, "d MMMM yyyy HH:mm")}</p>
                {item.note ? <p className="mt-1">{item.note}</p> : null}
              </div>
            ))
          ) : (
            <p>No history yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
