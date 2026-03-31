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
    <div className="space-y-6 pb-8 md:space-y-10">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[#050908]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(0,201,167,0.22),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_22%,rgba(85,140,255,0.07),transparent_32%)]" />
        <div className="relative z-10 mx-auto grid min-h-[620px] max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-12 lg:py-20">
          <div className="lg:pr-2">
            <Badge variant="purity" className="mb-6 rounded-full px-3 py-1 text-[11px] tracking-wide">
              Laboratory research materials · Independent COAs
            </Badge>
            <h1 className="font-display max-w-[680px] text-4xl font-semibold leading-[1.03] tracking-tight md:text-[62px]">
              High-purity peptide research compounds for laboratory use
            </h1>
            <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-[var(--text-muted)]">
              Independently tested materials with batch documentation and transparent specifications — for qualified
              research and analytical workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/shop">Shop catalog</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/research">Research library</Link>
              </Button>
            </div>
            <div className="mt-9 grid max-w-[760px] grid-cols-2 gap-3 text-sm text-[var(--text-muted)] md:grid-cols-4">
              {["Independent lab tested", "Batch-level reporting", "Structured fulfillment", "Research-use compliance"].map((t) => (
                <div
                  key={t}
                  className="flex min-h-[56px] items-center rounded-[var(--radius)] border border-[var(--border)] bg-[rgba(10,15,13,0.82)] px-4 py-3 backdrop-blur-sm"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:pl-2">
            <div className="relative mx-auto aspect-[16/11] max-w-[640px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0b1110] shadow-[0_32px_96px_rgba(0,0,0,0.54)]">
              <Image
                src="/hero-research-header.png"
                alt=""
                fill
                priority
                className="object-cover object-[78%_52%]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081110]/54 via-transparent to-[#081110]/18" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081110]/74 via-transparent to-transparent" />
              <div className="pointer-events-none absolute left-6 right-6 bottom-6 h-[64px] rounded-[12px] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.01))] opacity-40 blur-[1px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Featured catalog</h2>
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
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Commonly ordered</h2>
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
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Curated comparative research sets</h2>
            <p className="mt-4 text-[var(--text-muted)]">
              Structured bundle configurations for comparative laboratory workflows, with clearly defined component
              composition and catalog-level pricing consistency.
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
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Research procurement workflow</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { t: "Browse", d: "Navigate by category, evaluate specifications, and compare lot-level documentation." },
            { t: "Order", d: "Place secure orders with transparent totals and clear fulfillment updates." },
            { t: "Document", d: "Reference batch details, reports, and core material metadata in one place." },
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
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">What researchers say</h2>
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
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Latest research notes</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/research/${a.slug}`}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-6 transition hover:border-accent/40"
            >
              <p className="font-medium">{a.title}</p>
              <p className="mt-2 text-sm text-accent">Read →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Research updates</h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Occasional emails covering new documentation releases, restock notices, and catalog updates.
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
