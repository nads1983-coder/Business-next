import Link from "next/link";
import { productConfig } from "@/config/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoonPage({
  title,
  description,
  items,
  value,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  items: string[];
  value: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="calm" aria-label={`${title} status: Coming soon`}>
          Coming soon
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{value}</p>
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What this area is being designed to help with</CardTitle>
          <CardDescription>
            This feature is not available yet. The items below describe the intended direction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="rounded-md border p-3">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">{productConfig.disclaimer}</p>
        </CardContent>
      </Card>
    </div>
  );
}
