import { productConfig } from "@/config/product";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoonPage({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prepared for the next build stage</CardTitle>
          <CardDescription>
            These areas are intentionally light in Stage 1, with the foundations ready.
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
