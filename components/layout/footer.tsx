import Link from "next/link";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { DEFAULT_SITE_DISPLAY_NAME } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/bundles", label: "Research sets" },
      { href: "/research", label: "Research" },
      { href: "/protocols", label: "Research overviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-surface">
      <div className="container-shell grid gap-12 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_DISPLAY_NAME}
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Research catalog built for analytical workflows, batch documentation, and consistent specification visibility.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]/80">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)] py-6">
        <div className="container-shell">
          <FooterDisclaimer />
        </div>
      </div>
    </footer>
  );
}
