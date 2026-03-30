import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ui/product-card";
import { RatingStars } from "@/components/ui/rating-stars";
import { parseJsonArray } from "@/lib/utils";
import { NewsletterForm } from "@/components/newsletter-form";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = (await prisma.$queryRawUnsafe(`
      SELECT p.*, v.id as vid, v.price, v.size, v.compare_at FROM products p
      JOIN variants v ON v.product_id = p.id AND v.is_default = 1
      WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.name LIMIT 4
    `)) as Array<Record<string, unknown>>;

  const best = (await prisma.$queryRawUnsafe(`
      SELECT p.*, v.id as vid, v.price, v.size FROM products p
      JOIN variants v ON v.product_id = p.id AND v.is_default = 1
      WHERE p.is_active = 1 AND p.is_best_seller = 1 ORDER BY p.sold_count DESC LIMIT 8
    `)) as Array<Record<string, unknown>>;

  const reviews = (await prisma.$queryRawUnsafe(`
      SELECT r.rating, r.title, r.body, u.name FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.is_approved = 1 ORDER BY r.created_at DESC LIMIT 3
    `)) as Array<{ rating: number; title: string | null; body: string; name: string | null }>;

  const articles = [
    { slug: "peptide-purity-basics", title: "Understanding peptide purity in research materials" },
    { slug: "coa-readership", title: "How to read a certificate of analysis (COA)" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-surface to-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <Badge variant="purity" className="mb-4">
            Laboratory research materials · Independent COAs
          </Badge>
          <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            High-purity peptide research compounds for laboratory use
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
            Independently tested materials with batch documentation and transparent specifications — for qualified
            research and analytical workflows.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/shop">Shop catalog</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/research">Research library</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm text-[var(--text-muted)] md:grid-cols-4">
            {["Independent lab tested", "US warehouse", "Plain packaging", "Batch documentation"].map((t) => (
              <div key={t} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface/60 px-4 py-3">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Featured</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => {
            const imgs = parseJsonArray<string>(p.images as string, []);
            return (
              <ProductCard
                key={p.id as string}
                id={p.id as string}
                slug={p.slug as string}
                name={p.name as string}
                purity={p.purity as number | null}
                image={imgs[0] ?? "/placeholder-peptide.svg"}
                price={p.price as number}
                compareAt={p.compare_at as number | null}
                variantId={p.vid as string}
                size={p.size as string}
              />
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--border)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Commonly ordered</h2>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
            {best.map((p) => {
              const imgs = parseJsonArray<string>(p.images as string, []);
              return (
                <div key={p.id as string} className="w-64 shrink-0">
                  <ProductCard
                    id={p.id as string}
                    slug={p.slug as string}
                    name={p.name as string}
                    purity={p.purity as number | null}
                    image={imgs[0] ?? "/placeholder-peptide.svg"}
                    price={p.price as number}
                    variantId={p.vid as string}
                    size={p.size as string}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Multi-compound research sets</h2>
            <p className="mt-4 text-[var(--text-muted)]">
              Bundled catalog materials (e.g. BPC-157 with TB-500) for comparative laboratory research — offered at a
              discount versus separate purchase.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/bundles">View research sets</Link>
            </Button>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
            <Image src="/placeholder-peptide.svg" alt="" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { t: "Browse", d: "Filter by category, compare COAs, and select variants." },
            { t: "Order", d: "Checkout with crypto instructions and transparent totals." },
            { t: "Research", d: "Receive materials with batch documentation for your lab." },
          ].map((s) => (
            <Card key={s.t}>
              <CardContent className="p-6">
                <p className="font-display text-xl font-semibold text-accent">{s.t}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">What researchers say</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <RatingStars value={r.rating} />
                  {r.title ? <p className="mt-3 font-semibold">{r.title}</p> : null}
                  <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-4">{r.body}</p>
                  <p className="mt-4 text-xs text-[var(--text-muted)]">— {r.name ?? "Verified researcher"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Latest research notes</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/research/${a.slug}`}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-6 hover:border-accent/40"
            >
              <p className="font-medium">{a.title}</p>
              <p className="mt-2 text-sm text-accent">Read →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-semibold">Research updates</h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Occasional emails with new COAs, restock notices, and lab notes. Consent required.
          </p>
          <NewsletterForm />
          <div className="mt-10 text-left">
            <FooterDisclaimer />
          </div>
        </div>
      </section>
    </div>
  );
}
