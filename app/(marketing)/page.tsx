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
import { Container, Section, SectionHeading } from "@/components/ui/shell";
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
    <div className="pb-10">
      <section className="relative min-h-[760px] overflow-hidden bg-[#050908]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(11,158,139,0.22),transparent_30%),linear-gradient(90deg,#040807_0%,#05100e_38%,#071716_62%,#081514_100%)]" />

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid min-h-[760px] items-center lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative z-30 max-w-[620px] pb-20 pt-24">
              <Badge variant="purity" className="mb-6 inline-flex rounded-full border border-[#19d3bd]/40 bg-[#092420]/70 px-5 py-2 text-sm text-[#22d7c1]">
              Laboratory research materials · Independent COAs
              </Badge>

              <h1 className="max-w-[760px] font-display text-[68px] leading-[0.94] tracking-[-0.04em] text-white lg:text-[86px]">
              High-purity peptide research compounds for laboratory use
              </h1>

              <p className="mt-7 max-w-[760px] text-[25px] leading-[1.7] text-[#9eafaa]">
              Independently tested materials with batch documentation and transparent specifications — for qualified
              research and analytical workflows.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild className="rounded-[14px] bg-[#18d3be] px-8 py-4 text-[20px] font-medium text-black hover:bg-[#22dcc8]">
                <Link href="/shop">Shop catalog</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-[14px] border border-[#23312d] bg-[#0a0f0e]/80 px-8 py-4 text-[20px] font-medium text-white hover:bg-[#0e1513]"
                >
                <Link href="/research">Research library</Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
              {["Independent lab tested", "Batch-level reporting", "Structured fulfillment", "Research-use compliance"].map((t) => (
                  <div
                    key={t}
                    className="rounded-[14px] border border-[#1a2824] bg-[#09100f]/70 px-5 py-4 text-[18px] text-[#93a39d]"
                  >
                  {t}
                  </div>
              ))}
              </div>
            </div>

            <div className="relative hidden min-h-[760px] lg:block">
              <img
                src="/hero-right.png"
                alt="Peptide research products"
                className="pointer-events-none absolute bottom-0 right-[-20px] z-10 w-[760px] max-w-none select-none"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[120px] bg-gradient-to-r from-[#050908] via-[#050908]/70 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-surface section-shell">
        <Container className="grid gap-4 md:grid-cols-4">
          {[
            "Third-party lot verification",
            "COA documentation with each catalog item",
            "Cold-chain aware fulfillment process",
            "Research-use quality controls",
          ].map((item) => (
            <div key={item} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-4 py-3 text-sm text-[var(--text-muted)]">
              {item}
            </div>
          ))}
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeading>Featured catalog</SectionHeading>
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
        </Container>
      </Section>

      <section className="border-y border-[var(--border)] bg-surface section-shell">
        <Container>
          <SectionHeading>Commonly ordered</SectionHeading>
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
        </Container>
      </section>

      <section className="border-y border-[var(--border)] section-shell">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <SectionHeading className="md:text-[2.1rem]">Curated comparative research sets</SectionHeading>
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
        </Container>
      </section>

      <Section>
        <Container>
        <SectionHeading>Research procurement workflow</SectionHeading>
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
        </Container>
      </Section>

      <section className="border-t border-[var(--border)] section-shell">
        <Container>
          <SectionHeading>What researchers say</SectionHeading>
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
        </Container>
      </section>

      <Section>
        <Container>
        <SectionHeading>Latest research notes</SectionHeading>
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
        </Container>
      </Section>

      <section className="border-t border-[var(--border)] section-shell">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
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
