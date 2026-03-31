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
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[#060b0a]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(0,201,167,0.26),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(79,139,255,0.10),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.03)_60%,transparent)]" />
        <div className="relative z-10 mx-auto grid min-h-[620px] max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge variant="purity" className="mb-5">
              Laboratory research materials · Independent COAs
            </Badge>
            <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
              High-purity peptide research compounds for laboratory use
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
              Independently tested materials with batch documentation and transparent specifications — for qualified
              research and analytical workflows.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/shop">Shop catalog</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/research">Research library</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 text-sm text-[var(--text-muted)] md:grid-cols-4">
              {["Independent lab tested", "Batch-level reporting", "Structured fulfillment", "Research-use compliance"].map((t) => (
                <div key={t} className="rounded-[var(--radius)] border border-[var(--border)] bg-[rgba(10,15,13,0.82)] px-4 py-3 backdrop-blur-sm">
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="relative mx-auto aspect-[4/3] max-w-[560px] overflow-hidden rounded-[16px] border border-[var(--border)] bg-[linear-gradient(165deg,#0b1210_0%,#101a17_58%,#0b1210_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[rgba(0,201,167,0.17)] blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[rgba(79,139,255,0.11)] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071110] to-transparent" />

              <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <span>Batch-certified catalog</span>
                <span>Research panel</span>
              </div>

              <div className="absolute inset-x-8 bottom-12 grid grid-cols-3 gap-4">
                {[
                  { name: "BPC-157", dose: "10mg", cap: "from-slate-400 to-slate-300", glass: "from-[#d7fffa]/35 to-white/5" },
                  { name: "TB-500", dose: "10mg", cap: "from-blue-500 to-blue-300", glass: "from-[#d2e4ff]/30 to-white/5" },
                  { name: "Retatrutide", dose: "10mg", cap: "from-red-500 to-red-300", glass: "from-[#ffe0dc]/28 to-white/5" },
                ].map((v) => (
                  <div key={v.name} className="relative">
                    <div className="mx-auto h-[124px] w-[88px] rounded-[24px] border border-white/15 bg-gradient-to-b from-white/20 via-transparent to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_24px_rgba(0,0,0,0.35)]">
                      <div className={`mx-auto mt-[-8px] h-3 w-14 rounded-full bg-gradient-to-r ${v.cap}`} />
                      <div className={`mx-auto mt-2 h-[92px] w-[72px] rounded-[18px] bg-gradient-to-b ${v.glass} p-2`}>
                        <p className="truncate text-[9px] font-semibold text-white">{v.name}</p>
                        <p className="mt-1 text-[8px] text-white/80">{v.dose}</p>
                        <div className="mt-3 h-[28px] rounded-md border border-white/15 bg-black/25" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute right-6 top-20 hidden h-36 w-36 rounded-full border border-white/10 lg:block">
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
                <div className="absolute left-4 top-10 h-1.5 w-1.5 rounded-full bg-white/70" />
                <div className="absolute right-5 top-8 h-1.5 w-1.5 rounded-full bg-white/70" />
                <div className="absolute bottom-5 left-8 h-1.5 w-1.5 rounded-full bg-white/70" />
                <div className="absolute bottom-8 right-7 h-1.5 w-1.5 rounded-full bg-white/70" />
              </div>
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
