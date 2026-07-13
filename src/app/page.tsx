import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { productConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium text-primary">
            For first-time UK business owners
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            {productConfig.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {productConfig.promise}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            "What needs doing next",
            "When it is due",
            "What you need to complete it"
          ].map((item) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  {item}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Plain-English guidance that avoids accountant-style wording.
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          {productConfig.disclaimer}
        </p>
      </section>
    </main>
  );
}
