import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, FileQuestion } from "lucide-react";
import { plainCopy } from "@/content/plain-copy";
import { productConfig } from "@/config/product";
import { formatPoundsFromPence } from "@/lib/utils";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      tasks: {
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }]
      },
      reminders: true
    }
  });

  if (!business?.profile) {
    redirect("/app/onboarding");
  }

  const openTasks = business.tasks.filter((task) => task.status !== "COMPLETED");
  const nextTask = openTasks[0];
  const completedTasks = business.tasks.filter((task) => task.status === "COMPLETED");
  const needsInfo = business.tasks.filter((task) => task.status === "NEEDS_INFORMATION");
  const moneyLeft =
    business.profile.salesSoFarPence - business.profile.costsSoFarPence;
  const estimate = Math.max(Math.round(moneyLeft * 0.25), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Good to see you</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          What should I do next?
        </h1>
      </div>

      <Card className="border-primary/30 bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Your next task
          </CardTitle>
          <CardDescription>
            The most useful thing to look at right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextTask ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-normal">{nextTask.title}</h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">
                    {nextTask.plainEnglishSummary}
                  </p>
                </div>
                <Badge variant="calm">{plainCopy.status[nextTask.status]}</Badge>
              </div>
              <dl className="grid gap-4 md:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium">When is it due?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {nextTask.dueDate ? format(nextTask.dueDate, "d MMMM yyyy") : "No date yet"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">What happens if I do nothing?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    You may miss an official date or need to spend longer fixing records later.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">What do I need?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {nextTask.whatYouNeed.slice(0, 2).join(", ")}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/app/tasks">
                    Show me what to do <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline">Remind me later</Button>
                <Button variant="ghost">Mark as completed</Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">{plainCopy.emptyTasks}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Business admin health</CardTitle>
            <CardDescription>A simple signal, not a score.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">Getting organised</p>
              <p className="text-sm text-muted-foreground">
                {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimated amount to put aside</CardTitle>
            <CardDescription>{plainCopy.taxEstimate}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatPoundsFromPence(estimate)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on sales of {formatPoundsFromPence(business.profile.salesSoFarPence)} and
              costs of {formatPoundsFromPence(business.profile.costsSoFarPence)}.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Missing records or documents</CardTitle>
            <CardDescription>Things we need more information about.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <FileQuestion className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">{needsInfo.length} need attention</p>
              <p className="text-sm text-muted-foreground">
                We will keep this list short and clear.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Due soon</CardTitle>
            <CardDescription>Tasks to look at first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant="outline">{plainCopy.urgency[task.urgency]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{task.plainEnglishSummary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Helpful changes in your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              Business setup completed.
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              {completedTasks.length} completed task{completedTasks.length === 1 ? "" : "s"}.
            </p>
            <p>{productConfig.disclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
