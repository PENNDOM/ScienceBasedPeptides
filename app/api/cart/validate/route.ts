import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart";
import { calculateTotals } from "@/lib/cart";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import { getCanonicalProductImage } from "@/lib/product-pdp-theme";
import { parseJsonArray } from "@/lib/utils";

const schema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  discount: z
    .object({
      code: z.string(),
      type: z.string(),
      value: z.number(),
    })
    .nullable()
    .optional(),
  loyaltyPointsToRedeem: z.number().min(0).optional(),
  isSubscription: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart", details: parsed.error.flatten() }, { status: 400 });
  }
  const { items, discount, loyaltyPointsToRedeem = 0, isSubscription = false } = parsed.data;
  const enriched: CartItem[] = [];
  const issues: string[] = [];

  const variantRows = await prisma.variants.findMany({
    where: {
      id: { in: items.map((line) => line.variantId) },
      product_id: { in: items.map((line) => line.productId) },
    },
  });
  const products = await prisma.products.findMany({
    where: { id: { in: variantRows.map((v) => v.product_id) } },
    select: { id: true, name: true, slug: true, images: true, subscription_eligible: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const productFiles = listPublicProductFilenames();
  const variantMap = new Map(
    variantRows.map((v) => {
      const p = productMap.get(v.product_id);
      return [`${v.id}:${v.product_id}`, p ? { ...v, product: p } : null];
    })
  );

  for (const line of items) {
    const v = variantMap.get(`${line.variantId}:${line.productId}`);
    if (!v) {
      issues.push(`Invalid line: ${line.variantId}`);
      continue;
    }
    if (v.stock_qty < line.quantity) {
      issues.push(`Insufficient stock for ${v.product.name} (${v.size})`);
    }
    const imgs = mergeProductImagesWithDisk(v.product.slug, parseJsonArray<string>(v.product.images, []), productFiles);
    enriched.push({
      productId: line.productId,
      variantId: line.variantId,
      name: v.product.name,
      slug: v.product.slug,
      size: v.size,
      price: v.price,
      image: getCanonicalProductImage(v.product.slug, imgs),
      quantity: line.quantity,
      subscriptionEligible: Boolean(v.product.subscription_eligible),
    });
  }

  if (issues.length) {
    return NextResponse.json({ ok: false, issues, items: enriched }, { status: 400 });
  }

  const totals = calculateTotals(enriched, discount ?? null, loyaltyPointsToRedeem, isSubscription);
  return NextResponse.json({ ok: true, items: enriched, totals });
}
