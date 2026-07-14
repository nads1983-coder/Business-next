import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, FileQuestion } from "lucide-react";
import type { BusinessProfile } from "@prisma/client";
import { daysUntilText, taskDisplayBucket } from "@/lib/task-engine";
import { plainCopy } from "@/content/plain-copy";
import { productConfig } from "@/config/product";
import { formatPoundsFromPence } from "@/lib/utils";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function missingProfileItems(profile: BusinessProfile) {
  const items: string[] = [];
  if (profile.businessType === "NOT_SURE") items.push("business type");
  if (!profile.legalBusinessName) items.push("legal business name");
  if (!profile.startedTradingOn) items.push("date trading started");
  if (profile.businessType === "LIMITED_COMPANY" && !profile.companyRegisteredOn) items.push("incorporation date");
  if (profile.registeredForVat === "YES" && !profile.vatPeriodEndsOn) items.push("VAT period end");
  if (profile.employsPeople === "YES" && !profile.firstPayday) items.push("first payday");
  return items;
}

export default async function DashboardPage() {
  const { user } = await requireProductAccess();
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      tasks: {
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!business?.profile) {
    redirect("/app/onboarding");
  }

  const tasks = business.tasks;
  const needsAttention = tasks.filter((task) => taskDisplayBucket(task.status, task.dueDate) === "Needs attention");
  const comingUp = tasks.filter((task) => taskDisplayBucket(task.status, task.dueDate) === "Coming up");
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const notApplicable = tasks.filter((task) => task.status === "NOT_APPLICABLE");
  const nextTask = needsAttention[0] ?? comingUp[0];
  const missingItems = missingProfileItems(business.profile);
  const moneyLeft = business.profile.salesSoFarPence - business.profile.costsSoFarPence;
  const estimate = Math.max(Math.round(moneyLeft * 0.25), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Good to see you</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          What should I do next?
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{productConfig.promise}</p>
      </div>

      {missingItems.length ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" aria-hidden="true" />
              We need a little more information
            </CardTitle>
            <CardDescription>
              Add {missingItems.join(", ")} so Business Next can calculate every deadline without guessing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/settings">Complete business details</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-primary/30 bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Your next task
          </CardTitle>
          <CardDescription>The most useful deadline to look at right now.</CardDescription>
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
                  <dt className="text-sm font-medium">Due date</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {nextTask.dueDate ? format(nextTask.dueDate, "d MMMM yyyy") : "We need more information"}
                  </dd>
                  <dd className="mt-1 text-sm font-medium">{daysUntilText(nextTask.dueDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">Next action</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{nextTask.nextAction}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">Why it matters</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{nextTask.whyYouMayNeedIt}</dd>
                </div>
              </dl>
              <Button asChild>
                <Link href={`/app/tasks/${nextTask.id}`}>
                  Show me what to do <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">{plainCopy.emptyTasks}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ["Needs attention", needsAttention.length],
          ["Coming up", comingUp.length],
          ["Completed", completedTasks.length],
          ["Not applicable", notApplicable.length]
        ].map(([label, count]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <p className="text-2xl font-semibold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks to look at first</CardTitle>
            <CardDescription>Calm prompts, not panic buttons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...needsAttention, ...comingUp].slice(0, 5).map((task) => (
              <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-md border p-3 hover:bg-secondary">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant="outline">{plainCopy.status[task.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{daysUntilText(task.dueDate)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Planning signal</CardTitle>
            <CardDescription>{plainCopy.taxEstimate}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-semibold">{formatPoundsFromPence(estimate)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Based on sales of {formatPoundsFromPence(business.profile.salesSoFarPence)} and
                costs of {formatPoundsFromPence(business.profile.costsSoFarPence)}.
              </p>
            </div>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              {productConfig.disclaimer}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
