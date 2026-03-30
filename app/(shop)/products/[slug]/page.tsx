import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductPdp } from "@/components/shop/product-pdp";
import { parseJsonArray } from "@/lib/utils";
import { productJsonLd, siteMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(ctx: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await ctx.params;
  const p = await prisma.products.findFirst({
    where: { slug },
    select: { name: true, seo_title: true, seo_description: true, base_price: true },
  });
  if (!p) return siteMetadata();
  return {
    ...siteMetadata({
      title: p.seo_title ?? p.name,
      description: p.seo_description ?? undefined,
    }),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.products.findFirst({
    where: { slug, is_active: 1 },
  });
  if (!p) notFound();
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

  const reviewsRows = (await prisma.$queryRawUnsafe(
    `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 AND r.is_approved = 1 ORDER BY r.created_at DESC LIMIT 50`,
    p.id
  )) as Array<Record<string, unknown>>;

  const related = (await prisma.$queryRawUnsafe(
    `SELECT p2.id, p2.name, p2.slug, p2.short_description, p2.images, v.price, v.id AS variant_id, v.size
     FROM related_products rp
     JOIN products p2 ON p2.id = rp.related_id
     JOIN variants v ON v.product_id = p2.id AND v.is_default = 1
     WHERE rp.product_id = $1 LIMIT 12`,
    p.id
  )) as Array<Record<string, unknown>>;

  const jsonLd = productJsonLd({
    name: p.name as string,
    description: p.short_description || p.description,
    slug: p.slug,
    price: variants[0] ? variants[0].price : p.base_price,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductPdp
        product={{
          id: p.id as string,
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.short_description,
          scientificName: p.scientific_name,
          categoryName: category?.name ?? "",
          categorySlug: category?.slug ?? "",
          images: parseJsonArray<string>(p.images, []),
          purity: p.purity,
          molecularFormula: p.molecular_formula,
          casNumber: p.cas_number,
          storageInstructions: p.storage_instructions,
          cycleLengthDays: p.cycle_length_days,
          subscriptionEligible: Boolean(p.subscription_eligible),
          subscriptionDiscount: p.subscription_discount,
          tags: parseJsonArray<string>(p.tags, []),
        }}
        variants={variants.map((v) => ({
          id: v.id as string,
          size: v.size as string,
          price: v.price as number,
          compareAt: v.compare_at as number | null,
          stockQty: v.stock_qty as number,
          lowStockThreshold: v.low_stock_threshold as number,
        }))}
        labReports={labs.map((l) => ({
          labName: l.lab_name as string,
          batchNumber: l.batch_number as string,
          purity: l.purity as number,
          reportUrl: l.report_url as string,
          testedAt: Number(l.tested_at),
          isCurrent: Boolean(l.is_current),
        }))}
        reviews={reviewsRows.map((r) => ({
          id: r.id as string,
          rating: r.rating as number,
          title: r.title as string | null,
          body: r.body as string,
          userName: r.user_name as string | null,
        }))}
        related={related.map((r) => ({
          id: r.id as string,
          name: r.name as string,
          slug: r.slug as string,
          price: r.price as number,
          variant_id: r.variant_id as string,
          size: r.size as string,
        }))}
      />
    </>
  );
}
