import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import { parseJsonArray } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim();
  const sort = searchParams.get("sort") ?? "featured";
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 48));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  let sql = `
    SELECT p.*, c.slug AS category_slug, c.name AS category_name,
      v.id AS variant_id, v.size AS variant_size, v.price AS variant_price, v.compare_at AS variant_compare,
      lr.lab_name AS coa_lab, lr.purity AS coa_purity
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN variants v ON v.product_id = p.id AND v.is_default = 1
    LEFT JOIN lab_reports lr ON lr.product_id = p.id AND lr.is_current = 1
    WHERE p.is_active = 1
  `;
  const params: unknown[] = [];
  let idx = 1;
  if (category) {
    sql += ` AND c.slug = $${idx++}`;
    params.push(category);
  }
  if (search) {
    sql += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx + 1} OR p.scientific_name ILIKE $${idx + 2})`;
    const q = `%${search}%`;
    params.push(q, q, q);
    idx += 3;
  }

  const orderMap: Record<string, string> = {
    price_asc: "v.price ASC",
    price_desc: "v.price DESC",
    newest: "p.created_at DESC",
    best_seller: "p.sold_count DESC",
    featured: "p.is_featured DESC, p.is_best_seller DESC, p.name ASC",
  };
  sql += ` ORDER BY ${orderMap[sort] ?? orderMap.featured}`;
  sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = (await prisma.$queryRawUnsafe(sql, ...params)) as Array<Record<string, unknown>>;
  const productFiles = listPublicProductFilenames();
  const products = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.short_description,
    scientificName: r.scientific_name,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
    images: mergeProductImagesWithDisk(
      r.slug as string,
      parseJsonArray<string>(r.images as string, []),
      productFiles,
    ),
    basePrice: r.base_price,
    purity: r.purity,
    isFeatured: Boolean(r.is_featured),
    isBestSeller: Boolean(r.is_best_seller),
    subscriptionEligible: Boolean(r.subscription_eligible),
    tags: parseJsonArray<string>(r.tags as string, []),
    defaultVariant: {
      id: r.variant_id,
      size: r.variant_size,
      price: r.variant_price,
      compareAt: r.variant_compare,
    },
    labReport: r.coa_lab
      ? { labName: r.coa_lab, purity: r.coa_purity }
      : null,
  }));

  return NextResponse.json({ products });
}

const postSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  basePrice: z.number().positive(),
  sku: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  const id = nanoid();
  const vid = nanoid();
  await prisma.$transaction([
    prisma.products.create({
      data: {
        id,
        name: d.name,
        slug: d.slug,
        description: d.description,
        category_id: d.categoryId,
        images: "[]",
        base_price: d.basePrice,
        sku: d.sku,
        is_active: 1,
        tags: "[]",
      },
    }),
    prisma.variants.create({
      data: {
        id: vid,
        product_id: id,
        size: "Default",
        price: d.basePrice,
        sku: `${d.sku}-DEF`,
        stock_qty: 0,
        is_default: 1,
        display_order: 0,
      },
    }),
  ]);
  return NextResponse.json({ id, variantId: vid });
}
