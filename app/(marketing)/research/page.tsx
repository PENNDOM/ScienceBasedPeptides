import { prisma } from "@/lib/prisma";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import {
  getProductShopGridBackgroundCss,
  getShopGridImageObjectPosition,
  getShopGridProductImage,
} from "@/lib/product-pdp-theme";
import { mostPopularCatalogOrder, parseJsonArray } from "@/lib/utils";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductCard } from "@/components/ui/product-card";

export const dynamic = "force-dynamic";

export default async function ResearchHubPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
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
  };
  const where = {
    is_active: 1,
    ...(sp.q
      ? {
          OR: [
            { name: { contains: sp.q, mode: "insensitive" as const } },
            { description: { contains: sp.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const products = await prisma.products.findMany({
    where,
    orderBy: (orderMap[sort] ?? orderMap.most_popular).map((o) => ({ [o.field]: o.dir })),
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
      return {
        ...p,
        price: v.price,
        compareAt: v.compare_at,
        variantId: v.id,
        size: v.size,
        image: primaryImage,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  if (sort === "price_asc") rows.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === "price_desc") rows.sort((a, b) => Number(b.price) - Number(a.price));
  else if (sort === "most_popular") rows = mostPopularCatalogOrder(rows);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-12 md:px-6 md:pb-28">
      <section className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(120deg,rgba(169,212,236,0.2),rgba(243,239,231,0.95),rgba(207,231,245,0.16))] p-6 shadow-[0_16px_40px_rgba(30,26,23,0.1)] md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">Research Catalog Overview</h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
          This research catalog is structured for analytical workflows across peptides, blends, and lab solutions. Every product page is
          aligned to standardized batch documentation, specification visibility, and laboratory-use disclaimers so you can review catalog-wide
          standards first, then drill down product by product.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-surface/80 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Batch consistency</p>
            <p className="mt-2 text-sm">Batch identifiers are maintained across product and research pages for traceable review.</p>
          </div>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-surface/80 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Specification clarity</p>
            <p className="mt-2 text-sm">Compound, quantity, and relevant technical fields are presented in a consistent layout.</p>
          </div>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-surface/80 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">COA support</p>
            <p className="mt-2 text-sm">Certificate of Analysis requests are available directly from each individual product page.</p>
          </div>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-surface/80 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Research-use standard</p>
            <p className="mt-2 text-sm">Products are listed for laboratory research use only and not for human consumption.</p>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-5">
        <div>
          <h2 className="font-display text-3xl font-semibold">Research</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Browse compound-specific research reference pages.</p>
        </div>
        <ShopToolbar initialQuery={sp.q ?? ""} initialSort={sort} />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((p, index) => {
          const slug = p.slug as string;
          const imgs = mergeProductImagesWithDisk(
            slug,
            parseJsonArray<string>(p.images as string, []),
            productFiles,
          );
          return (
            <ProductCard
              key={p.id as string}
              id={p.id as string}
              slug={slug}
              name={p.name as string}
              purity={(p.purity as number | null) ?? null}
              image={getShopGridProductImage(slug, imgs)}
              price={p.price as number}
              compareAt={(p.compareAt as number | null) ?? null}
              variantId={p.variantId as string}
              size={p.size as string}
              variantSizes={sizesByProduct.get(p.id as string)}
              context="research"
              priority={index < 4}
              heroBackgroundCss={getProductShopGridBackgroundCss(slug)}
              imageObjectPosition={getShopGridImageObjectPosition(slug)}
            />
          );
        })}
      </div>
    </div>
  );
}
