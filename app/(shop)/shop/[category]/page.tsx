import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/product-card";
import { parseJsonArray } from "@/lib/utils";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { Container, SectionHeading } from "@/components/ui/shell";

export const dynamic = "force-dynamic";

export default async function CategoryShopPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = await prisma.categories.findFirst({
    where: { slug: category },
    select: { id: true, name: true, description: true },
  });
  const products = await prisma.products.findMany({
    where: {
      is_active: 1,
      ...(cat ? { category_id: cat.id } : { category_id: "__missing__" }),
    },
    orderBy: { name: "asc" },
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

  return (
    <Container className="section-shell">
      <p className="text-sm text-[var(--text-muted)]">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>{" "}
        / {cat?.name ?? category}
      </p>
      <SectionHeading className="mt-4">{cat?.name ?? "Category"}</SectionHeading>
      {cat?.description ? (
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)]">{cat.description}</p>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Materials in this category are for laboratory and analytical research only.
        </p>
      )}
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
