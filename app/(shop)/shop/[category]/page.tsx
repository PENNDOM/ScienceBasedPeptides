import Link from "next/link";
import getDb from "@/db/index";
import { ProductCard } from "@/components/ui/product-card";
import { parseJsonArray } from "@/lib/utils";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export const dynamic = "force-dynamic";

export default async function CategoryShopPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const db = getDb();
  const cat = db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(category) as
    | { name: string; description: string | null }
    | undefined;
  const rows = db
    .prepare(
      `SELECT p.*, v.id as vid, v.price, v.size, v.compare_at FROM products p
       JOIN variants v ON v.product_id = p.id AND v.is_default = 1
       JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND c.slug = ? ORDER BY p.name`
    )
    .all(category) as Array<Record<string, unknown>>;

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
