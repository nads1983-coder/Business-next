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
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/support" className="hover:text-foreground">Support</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </header>
      <div className={narrow ? "mx-auto max-w-3xl px-6 py-10" : "mx-auto max-w-6xl px-6 py-10"}>
        {children}
      </div>
    </main>
  );
}
