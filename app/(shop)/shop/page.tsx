import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/product-card";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import {
  getProductShopGridBackgroundCss,
  getShopGridImageObjectFit,
  getShopGridProductImage,
} from "@/lib/product-pdp-theme";
import { mostPopularCatalogOrder, parseJsonArray } from "@/lib/utils";
import { ShopToolbar } from "@/components/shop/shop-toolbar";

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
  const sort = sp.sort ?? "most_popular";
  const orderMap: Record<string, { field: "created_at" | "sold_count" | "name"; dir: "asc" | "desc" }[]> = {
    most_popular: [
      { field: "sold_count", dir: "desc" },
      { field: "name", dir: "asc" },
    ],
    a_z: [{ field: "name", dir: "asc" }],
    z_a: [{ field: "name", dir: "desc" }],
    price_asc: [{ field: "name", dir: "asc" }],
    price_desc: [{ field: "name", dir: "asc" }],
    newest: [{ field: "created_at", dir: "desc" }],
    best_seller: [{ field: "sold_count", dir: "desc" }],
    featured: [
      { field: "name", dir: "asc" },
      { field: "sold_count", dir: "desc" },
    ],
  };
  const sortKey = sort === "featured" ? "most_popular" : sort;
  const products = await prisma.products.findMany({
    where,
    orderBy: (orderMap[sortKey] ?? orderMap.most_popular).map((o) => ({ [o.field]: o.dir })),
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
  let rows = products
    .map((p) => {
      const v = variantByProduct.get(p.id);
      if (!v) return null;
      const imgs = mergeProductImagesWithDisk(p.slug as string, parseJsonArray<string>(p.images, []), productFiles);
      const primaryImage = getShopGridProductImage(p.slug as string, imgs);
      if (primaryImage === "/placeholder-peptide.svg") return null;
      return { ...p, vid: v.id, price: v.price, size: v.size, compare_at: v.compare_at };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;
  if (sort === "price_asc") {
    rows.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price_desc") {
    rows.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === "most_popular") {
    rows = mostPopularCatalogOrder(rows);
  }
  const hasCenteredTailRow = rows.length > 5 && rows.length % 5 === 4;
  const mainRows = hasCenteredTailRow ? rows.slice(0, -4) : rows;
  const tailRows = hasCenteredTailRow ? rows.slice(-4) : [];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-12 md:px-6 md:pb-28">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-3xl font-semibold">All Products</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Premium research peptides with 99%+ purity</p>
        </div>
        <ShopToolbar initialQuery={sp.q ?? ""} initialSort={sortKey} />
      </div>
      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {mainRows.map((p, index) => {
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
              priority={index < 5}
              heroBackgroundCss={getProductShopGridBackgroundCss(p.slug as string)}
              imageObjectFit={getShopGridImageObjectFit(p.slug as string)}
            />
          );
        })}
      </div>
      {tailRows.length === 4 ? (
        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:mx-auto xl:w-[calc(80%-0.3rem)] xl:grid-cols-4">
          {tailRows.map((p, index) => {
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
                priority={mainRows.length + index < 5}
                heroBackgroundCss={getProductShopGridBackgroundCss(p.slug as string)}
                imageObjectFit={getShopGridImageObjectFit(p.slug as string)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
