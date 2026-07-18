import Link from "next/link";
import { productConfig } from "@/config/product";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            {productConfig.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/guides" className="hover:text-foreground">Guides</Link>
            <Link href="/deadlines" className="hover:text-foreground">Deadlines</Link>
            <Link href="/checklists" className="hover:text-foreground">Checklists</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/support" className="hover:text-foreground">Support</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </header>
      <div className={narrow ? "mx-auto max-w-3xl px-6 py-10" : "mx-auto max-w-6xl px-6 py-10"}>
        {children}
      </div>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{productConfig.name} is operated by Nadine Pierre Ltd.</p>
          <nav className="flex flex-wrap gap-4" aria-label="Legal">
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
    </main>
  );
}
