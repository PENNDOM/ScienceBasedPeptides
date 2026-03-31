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
  { href: "/referrals", label: "Affiliate" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
  { href: "/research", label: "Research" },
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
      <div className="relative mx-auto flex min-h-[88px] max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-[var(--text)] md:text-2xl">
          {process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_DISPLAY_NAME}
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full border border-transparent px-4 py-2.5 text-base font-semibold tracking-tight text-[var(--text-muted)] transition hover:border-accent/30 hover:bg-surface hover:text-[var(--text)]",
                pathname === l.href && "border-accent/40 bg-accent-muted text-accent"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 pr-[env(safe-area-inset-right)] md:pr-0">
          {user?.role === "admin" ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account" className="inline-flex items-center rounded-full p-1.5" aria-label="Profile">
                <User className="h-4 w-4" />
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
            className="rounded-xl border border-white/10 bg-surface/80 p-2.5 shadow-[0_8px_18px_rgba(0,0,0,0.28)] transition active:scale-[0.98] md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div
          className="mobile-menu-backdrop fixed inset-0 z-50 bg-black/60 px-4 pb-6 pt-[calc(env(safe-area-inset-top)+84px)] backdrop-blur-[6px] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="mobile-menu-panel mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(12,18,22,0.98),rgba(9,13,16,0.98))] p-3 shadow-[0_22px_50px_rgba(0,0,0,0.44)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl border border-transparent px-4 py-3 text-[15px] font-semibold leading-6 tracking-tight text-[var(--text-muted)] transition hover:border-accent/30 hover:bg-surface hover:text-[var(--text)] active:opacity-85",
                  pathname === l.href && "border-accent/40 bg-accent-muted text-accent"
                )}
              >
                {l.label}
              </Link>
            ))}
            </div>
          </div>
        </div>
      ) : null}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
