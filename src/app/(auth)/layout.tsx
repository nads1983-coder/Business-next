import Link from "next/link";
import type { Metadata } from "next";
import { productConfig } from "@/config/product";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Account access",
  description: "Sign in to Business Sorted or create an account.",
  path: "/login",
  noindex: true
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-8">
      <Link href="/" className="mx-auto text-sm font-semibold text-primary">
        {productConfig.name}
      </Link>
      <div className="flex min-w-0 flex-1 items-center justify-center py-6">{children}</div>
    </main>
  );
}
