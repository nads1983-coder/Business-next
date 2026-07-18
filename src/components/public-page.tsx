import Link from "next/link";
import { productConfig } from "@/config/product";
import { MobileNav, type MobileNavItem } from "@/components/mobile-nav";

export const publicNavItems: MobileNavItem[] = [
  { label: "Guides", href: "/guides" },
  { label: "Deadlines", href: "/deadlines" },
  { label: "Checklists", href: "/checklists" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
  { label: "Sign in", href: "/login" }
];

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <p className="max-w-3xl leading-6">{productConfig.tradingNameDisclosure}</p>
        <nav className="flex min-w-0 flex-wrap gap-3 sm:gap-4" aria-label="Legal">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/glossary" className="hover:text-foreground">Glossary</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/subscription-terms" className="hover:text-foreground">Subscription terms</Link>
          <Link href="/refunds" className="hover:text-foreground">Refunds</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicPage({
  children,
  narrow = false
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="font-semibold">
            {productConfig.name}
          </Link>
          <nav className="hidden flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:flex">
            {publicNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav items={publicNavItems} footer={productConfig.tradingNameDisclosure} />
        </div>
      </header>
      <div className={narrow ? "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10" : "mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"}>
        {children}
      </div>
      <PublicFooter />
    </main>
  );
}
