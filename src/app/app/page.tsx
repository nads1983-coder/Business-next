import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileQuestion,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BusinessProfile } from "@prisma/client";
import { daysUntilText, taskDisplayBucket } from "@/lib/task-engine";
import { plainCopy } from "@/content/plain-copy";
import { productConfig } from "@/config/product";
import { formatPoundsFromPence } from "@/lib/utils";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";
import { onboardingDraftKey } from "@/lib/onboarding-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearOnboardingDraft } from "@/components/clear-onboarding-draft";

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
      },
      companiesHouseChanges: {
        where: { acknowledgedAt: null },
        orderBy: { detectedAt: "desc" },
        take: 5
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
  const activeTasks = needsAttention.length + comingUp.length;
  const progressTotal = activeTasks + completedTasks.length + notApplicable.length;
  const completionPercent = progressTotal
    ? Math.round(((completedTasks.length + notApplicable.length) / progressTotal) * 100)
    : 0;
  const summaryCards: Array<{
    label: string;
    count: number;
    icon: LucideIcon;
    description: string;
  }> = [
    { label: "Needs attention", count: needsAttention.length, icon: Target, description: "Look here first" },
    { label: "Coming up", count: comingUp.length, icon: Clock, description: "Plan without pressure" },
    { label: "Completed", count: completedTasks.length, icon: CheckCircle2, description: "Saved in history" },
    { label: "Handled", count: notApplicable.length, icon: ShieldCheck, description: "Marked not applicable" }
  ];
  const moneyLeft = business.profile.salesSoFarPence - business.profile.costsSoFarPence;
  const estimate = Math.max(Math.round(moneyLeft * 0.25), 0);
  const pendingCompaniesHouseChanges = business.companiesHouseChanges.length;

  return (
    <div className="space-y-6">
      <ClearOnboardingDraft storageKey={onboardingDraftKey(user.id)} />
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
        <p className="text-sm font-medium text-primary">Good to see you</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          What should I do next?
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{productConfig.promise}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm lg:min-w-72">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">Set-up progress</p>
            <p className="text-sm font-semibold text-primary">{completionPercent}% calm</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted" aria-hidden="true">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Completed and not-applicable tasks count as handled. Missing profile details are shown first.
          </p>
        </div>
      </div>

      {missingItems.length ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" aria-hidden="true" />
              We need a little more information
            </CardTitle>
            <CardDescription>
              Add {missingItems.join(", ")} so Business Sorted can calculate every deadline without guessing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/settings">Complete business details</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {pendingCompaniesHouseChanges ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Company details changed
            </CardTitle>
            <CardDescription>
              Companies House has updated {pendingCompaniesHouseChanges === 1 ? "one detail" : `${pendingCompaniesHouseChanges} details`}.
              Review the before and after values before relying on the new information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/settings">Review Companies House updates</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-primary/30 bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Your next best action
          </CardTitle>
          <CardDescription>Chosen from the deadlines most likely to need your attention first.</CardDescription>
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
            <div className="rounded-md border bg-background p-4">
              <p className="font-medium">No active task needs your attention right now.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {plainCopy.emptyTasks} You can still review your profile or completed tasks any time.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/app/settings">Review business details</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {summaryCards.map(({ label, count, icon: Icon, description }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <p className="text-2xl font-semibold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks to look at first</CardTitle>
            <CardDescription>Ordered to reduce guesswork, not create panic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...needsAttention, ...comingUp].slice(0, 5).length ? (
              [...needsAttention, ...comingUp].slice(0, 5).map((task) => (
                <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-md border p-3 hover:bg-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="outline">{plainCopy.status[task.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{daysUntilText(task.dueDate)}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Your current list is clear. Business Sorted will bring deadlines back here when they need attention.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              Planning signal
            </CardTitle>
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
