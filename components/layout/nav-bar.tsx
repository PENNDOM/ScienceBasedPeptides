"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_SITE_DISPLAY_NAME } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/bundles", label: "Research sets" },
  { href: "/research", label: "Research" },
  { href: "/protocols", label: "Research overviews" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function NavBar() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((s) => s.itemCount());
  useEffect(() => setMounted(true), []);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-[var(--text)] md:text-2xl">
          {process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_DISPLAY_NAME}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-[var(--text-muted)] transition hover:text-accent",
                pathname === l.href && "text-accent"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user?.role === "admin" ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account" className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Button variant="secondary" size="sm" type="button" onClick={() => setCartOpen(true)} className="relative">
            <ShoppingBag className="h-4 w-4" />
            {mounted && count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-[#0a0f0d]">
                {count}
              </span>
            ) : null}
          </Button>
          <button
            type="button"
            className="rounded-md p-2 md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-[var(--border)] bg-bg px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[var(--text-muted)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
