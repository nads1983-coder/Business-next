import Link from "next/link";
import { productConfig } from "@/config/product";
import { MobileNav, type MobileNavItem } from "@/components/mobile-nav";

export const publicNavItems: MobileNavItem[] = [
  { label: "Guides", href: "/guides" },
  { label: "Resources", href: "/resources" },
  { label: "Tools", href: "/tools" },
  { label: "Deadlines", href: "/deadlines" },
  { label: "Checklists", href: "/checklists" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
  { label: "Sign in", href: "/login" }
];

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <p className="max-w-3xl min-w-0 leading-6">{productConfig.tradingNameDisclosure}</p>
        <nav className="flex min-w-0 max-w-3xl flex-wrap gap-3 sm:gap-4 lg:justify-end" aria-label="Legal">
          <Link href="/resources" className="hover:text-foreground">Resources</Link>
          <Link href="/tools" className="hover:text-foreground">Tools</Link>
          <Link href="/comparisons" className="hover:text-foreground">Comparisons</Link>
          <Link href="/downloads" className="hover:text-foreground">Downloads</Link>
          <Link href="/updates" className="hover:text-foreground">Updates</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/editorial-policy" className="hover:text-foreground">Editorial policy</Link>
          <Link href="/how-we-research" className="hover:text-foreground">How we research</Link>
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
