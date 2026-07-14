import { format } from "date-fns";
import { RuleContentForm } from "./rule-content-form";
import { requireAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const rules = await prisma.complianceRule.findMany({
    orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }],
    include: {
      contentVersions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { changedBy: { select: { email: true } } }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Admin content</h1>
        <p className="mt-2 text-muted-foreground">
          Update explanatory content and source metadata. Deadline calculation logic changes require a code and rule-version update.
        </p>
      </div>
      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <CardTitle>{rule.key}</CardTitle>
              <CardDescription>
                Version from {format(rule.effectiveFrom, "d MMMM yyyy")} · {rule.reviewStatus}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RuleContentForm rule={rule} />
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Recent content history</h2>
                {rule.contentVersions.length ? (
                  rule.contentVersions.map((version) => (
                    <div key={version.id} className="rounded-md border p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{version.plainName}</p>
                      <p>{format(version.createdAt, "d MMMM yyyy HH:mm")} by {version.changedBy?.email ?? "unknown"}</p>
                      {version.changeNote ? <p>{version.changeNote}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No content changes yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
