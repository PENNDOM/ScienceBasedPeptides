import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const p = await prisma.products.findFirst({
    where: { slug, is_active: 1 },
  });
  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const category = await prisma.categories.findFirst({
    where: { id: p.category_id },
    select: { name: true, slug: true },
  });

  const variants = await prisma.variants.findMany({
    where: { product_id: p.id },
    orderBy: { display_order: "asc" },
  });

  const labs = await prisma.lab_reports.findMany({
    where: { product_id: p.id },
    orderBy: { tested_at: "desc" },
  });

  const reviews = (await prisma.$queryRawUnsafe(
    `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 AND r.is_approved = 1 ORDER BY r.created_at DESC LIMIT 50`,
    p.id
  )) as Array<Record<string, unknown>>;

  const related = await prisma.$queryRawUnsafe(
    `SELECT p2.id, p2.name, p2.slug, p2.short_description, p2.images, v.price, v.id AS variant_id, v.size
     FROM related_products rp
     JOIN products p2 ON p2.id = rp.related_id
     JOIN variants v ON v.product_id = p2.id AND v.is_default = 1
     WHERE rp.product_id = $1 LIMIT 12`,
    p.id
  );

  return NextResponse.json({
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.short_description,
      scientificName: p.scientific_name,
      categoryName: category?.name ?? "",
      categorySlug: category?.slug ?? "",
      images: parseJsonArray<string>(p.images, []),
      basePrice: p.base_price,
      comparePriceAt: p.compare_price_at,
      purity: p.purity,
      molecularFormula: p.molecular_formula,
      casNumber: p.cas_number,
      storageInstructions: p.storage_instructions,
      cycleLengthDays: p.cycle_length_days,
      isFeatured: Boolean(p.is_featured),
      isBestSeller: Boolean(p.is_best_seller),
      subscriptionEligible: Boolean(p.subscription_eligible),
      subscriptionDiscount: p.subscription_discount,
      tags: parseJsonArray<string>(p.tags, []),
      soldCount: p.sold_count,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
    },
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      price: v.price,
      compareAt: v.compare_at,
      sku: v.sku,
      stockQty: v.stock_qty,
      lowStockThreshold: v.low_stock_threshold,
      isDefault: Boolean(v.is_default),
    })),
    labReports: labs.map((l) => ({
      id: l.id,
      batchNumber: l.batch_number,
      labName: l.lab_name,
      purity: l.purity,
      reportUrl: l.report_url,
      testedAt: Number(l.tested_at),
      isCurrent: Boolean(l.is_current),
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      isVerified: Boolean(r.is_verified),
      createdAt: r.created_at,
      userName: r.user_name,
    })),
    relatedProducts: related,
  });
}
