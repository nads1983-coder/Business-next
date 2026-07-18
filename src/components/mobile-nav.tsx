"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type MobileNavItem = {
  label: string;
  href: string;
  status?: string;
};

export function MobileNav({
  label = "Menu",
  items,
  footer
}: {
  label?: string;
  items: MobileNavItem[];
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="sm:hidden">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            aria-label="Close navigation menu backdrop"
            className="absolute inset-0 h-full w-full bg-foreground/30"
            onClick={closeMenu}
          />
          <div
            id="mobile-navigation"
            className="absolute inset-x-3 top-3 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-lg border bg-background p-4 shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">Business Sorted</p>
              <Button ref={closeButtonRef} type="button" variant="ghost" size="icon" aria-label="Close navigation menu" onClick={closeMenu}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <nav className="mt-4" aria-label="Mobile navigation">
              <ul className="grid gap-2">
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium ${
                          active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.status ? (
                          <span
                            className="ml-3 shrink-0 rounded-md border border-primary/20 bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground"
                            aria-label={`${item.label} status: ${item.status}`}
                          >
                            {item.status}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {footer ? <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">{footer}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
