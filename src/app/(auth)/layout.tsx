import Link from "next/link";
import { productConfig } from "@/config/product";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-8">
      <Link href="/" className="mx-auto text-sm font-semibold text-primary">
        {productConfig.name}
      </Link>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
