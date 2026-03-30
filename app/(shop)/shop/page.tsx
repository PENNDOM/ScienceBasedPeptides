import Link from "next/link";
import getDb from "@/db/index";
import { ProductCard } from "@/components/ui/product-card";
import { parseJsonArray } from "@/lib/utils";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const db = getDb();
  let sql = `
    SELECT p.*, v.id as vid, v.price, v.size, v.compare_at, c.slug as cat_slug
    FROM products p
    JOIN variants v ON v.product_id = p.id AND v.is_default = 1
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1`;
  const params: unknown[] = [];
  if (sp.category) {
    sql += ` AND c.slug = ?`;
    params.push(sp.category);
  }
  if (sp.q) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    const q = `%${sp.q}%`;
    params.push(q, q);
  }
  const sort = sp.sort ?? "featured";
  const orderMap: Record<string, string> = {
    price_asc: "v.price ASC",
    price_desc: "v.price DESC",
    newest: "p.created_at DESC",
    best_seller: "p.sold_count DESC",
    featured: "p.is_featured DESC, p.name ASC",
  };
  sql += ` ORDER BY ${orderMap[sort] ?? orderMap.featured}`;
  const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Shop</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Catalog items are supplied for laboratory and analytical research only. Not for human consumption.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/shop" className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-accent/40">
            All
          </Link>
          <Link href="/shop?sort=price_asc" className="rounded-md border border-[var(--border)] px-3 py-1">
            Price ↑
          </Link>
          <Link href="/shop?sort=price_desc" className="rounded-md border border-[var(--border)] px-3 py-1">
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
    </div>
  );
}
