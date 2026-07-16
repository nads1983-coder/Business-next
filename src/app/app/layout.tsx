import Link from "next/link";
import type { Metadata } from "next";
import { productConfig } from "@/config/product";
import { pageMetadata } from "@/lib/seo";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = pageMetadata({
  title: "Business Sorted app",
  description: "Private Business Sorted account area.",
  path: "/app",
  noindex: true
});

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const dbUser = await getPrisma().user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });
  const navigation = productConfig.navigation.filter((item) => !("adminOnly" in item) || dbUser?.role === "ADMIN");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/app" className="font-semibold text-foreground">
            {productConfig.name}
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav aria-label="Main navigation" className="md:sticky md:top-20 md:h-fit">
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
