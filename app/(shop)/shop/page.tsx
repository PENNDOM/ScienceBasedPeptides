import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/product-card";
import { parseJsonArray } from "@/lib/utils";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { Container, SectionHeading } from "@/components/ui/shell";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category
    ? await prisma.categories.findFirst({ where: { slug: sp.category } })
    : null;

  const where = {
    is_active: 1,
    ...(category ? { category_id: category.id } : {}),
    ...(sp.q
      ? {
          OR: [
            { name: { contains: sp.q, mode: "insensitive" as const } },
            { description: { contains: sp.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const sort = sp.sort ?? "featured";
  const orderMap: Record<string, { field: "created_at" | "sold_count" | "name"; dir: "asc" | "desc" }[]> = {
    price_asc: [{ field: "name", dir: "asc" }],
    price_desc: [{ field: "name", dir: "asc" }],
    newest: [{ field: "created_at", dir: "desc" }],
    best_seller: [{ field: "sold_count", dir: "desc" }],
    featured: [
      { field: "name", dir: "asc" },
      { field: "sold_count", dir: "desc" },
    ],
  };
  const products = await prisma.products.findMany({
    where,
    orderBy: (orderMap[sort] ?? orderMap.featured).map((o) => ({ [o.field]: o.dir })),
  });
  const variants = await prisma.variants.findMany({
    where: {
      product_id: { in: products.map((p) => p.id) },
      is_default: 1,
    },
  });
  const variantByProduct = new Map(variants.map((v) => [v.product_id, v]));
  const rows = products
    .map((p) => {
      const v = variantByProduct.get(p.id);
      if (!v) return null;
      return { ...p, vid: v.id, price: v.price, size: v.size, compare_at: v.compare_at };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;
  if (sort === "price_asc") {
    rows.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price_desc") {
    rows.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <Container className="section-shell">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionHeading>Shop</SectionHeading>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Catalog items are supplied for laboratory and analytical research only. Not for human consumption.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/shop" className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5 hover:border-accent/40">
            All
          </Link>
          <Link href="/shop?sort=price_asc" className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5">
            Price ↑
          </Link>
          <Link href="/shop?sort=price_desc" className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5">
            Price ↓
          </Link>
        </div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((p) => {
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
      <div className="mt-12 max-w-3xl">
        <FooterDisclaimer />
      </div>
    </Container>
  );
}
