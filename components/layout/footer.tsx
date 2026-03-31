"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { DEFAULT_SITE_DISPLAY_NAME } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact#faq", label: "FAQ" },
      { href: "/contact#contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/contact#returns", label: "Refund policy" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const footerContentClass = isHomePage
    ? "mx-auto grid max-w-7xl gap-10 px-4 pt-20 pb-16 md:grid-cols-4 md:pt-20"
    : "mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4";

  return (
    <footer
      className={
        isHomePage
          ? "mt-0 border-t border-transparent bg-transparent pt-0"
          : "mt-0 border-t border-[var(--border)] bg-surface pt-12"
      }
    >
      <div className={footerContentClass}>
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_DISPLAY_NAME}
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Research catalog built for analytical workflows, batch documentation, and consistent specification visibility.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]/85">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/contact#") ? (
                    <a href={l.href} className="text-sm text-[var(--text-muted)] transition hover:text-accent">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-[var(--text-muted)] transition hover:text-accent">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={isHomePage ? "border-t border-transparent px-4 py-6" : "border-t border-[var(--border)] px-4 py-6"}>
        <div className="mx-auto max-w-7xl">
          <FooterDisclaimer />
        </div>
      </div>
    </footer>
  );
}
