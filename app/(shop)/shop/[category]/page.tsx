import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/product-card";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import {
  getProductShopGridBackgroundCss,
  getShopGridImageObjectFit,
  getShopGridProductImage,
} from "@/lib/product-pdp-theme";
import { parseJsonArray } from "@/lib/utils";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

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
  const allSizes = await prisma.variants.findMany({
    where: {
      product_id: { in: products.map((p) => p.id) },
    },
    select: { product_id: true, size: true, display_order: true },
    orderBy: [{ product_id: "asc" }, { display_order: "asc" }],
  });
  const variantByProduct = new Map(variants.map((v) => [v.product_id, v]));
  const productFiles = listPublicProductFilenames();
  const sizesByProduct = new Map<string, string[]>();
  for (const row of allSizes) {
    const next = sizesByProduct.get(row.product_id) ?? [];
    if (!next.includes(row.size)) next.push(row.size);
    sizesByProduct.set(row.product_id, next);
  }
  const rows = products
    .map((p) => {
      const v = variantByProduct.get(p.id);
      if (!v) return null;
      return { ...p, vid: v.id, price: v.price, size: v.size, compare_at: v.compare_at };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm text-[var(--text-muted)]">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>{" "}
        / {cat?.name ?? category}
      </p>
      <h1 className="font-display mt-4 text-3xl font-semibold">{cat?.name ?? "Category"}</h1>
      {cat?.description ? (
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)]">{cat.description}</p>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Materials in this category are for laboratory and analytical research only.
        </p>
      )}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {rows.map((p) => {
          const imgs = mergeProductImagesWithDisk(
            p.slug as string,
            parseJsonArray<string>(p.images as string, []),
            productFiles,
          );
          return (
            <ProductCard
              key={p.id as string}
              id={p.id as string}
              slug={p.slug as string}
              name={p.name as string}
              purity={p.purity as number | null}
              image={getShopGridProductImage(p.slug as string, imgs)}
              price={p.price as number}
              compareAt={p.compare_at as number | null}
              variantId={p.vid as string}
              size={p.size as string}
              variantSizes={sizesByProduct.get(p.id as string)}
              heroBackgroundCss={getProductShopGridBackgroundCss(p.slug as string)}
              imageObjectFit={getShopGridImageObjectFit(p.slug as string)}
            />
          );
        })}
      </div>
      <div className="mt-12 max-w-3xl">
        <FooterDisclaimer />
      </div>
    </div>
  );
}
