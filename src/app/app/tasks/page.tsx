import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { plainCopy } from "@/content/plain-copy";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TasksPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    include: { tasks: { orderBy: { dueDate: "asc" } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">My tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Clear steps for the business jobs that need your attention.
        </p>
      </div>
      <div className="grid gap-4">
        {business?.tasks.length ? (
          business.tasks.map((task) => (
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
              <CardContent className="grid gap-5 md:grid-cols-3">
                <div>
                  <h2 className="text-sm font-medium">Due date</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.dueDate ? format(task.dueDate, "d MMMM yyyy") : "No date yet"}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-medium">What you need</h2>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {task.whatYouNeed.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm font-medium">Steps</h2>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                    {task.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  {task.officialSourceUrl ? (
                    <a
                      href={task.officialSourceUrl}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline"
                    >
                      Official guidance <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                <p className="md:col-span-3 text-sm text-muted-foreground">
                  {task.adviceBoundary}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {plainCopy.emptyTasks}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
