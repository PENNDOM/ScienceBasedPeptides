import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  const rows = await prisma.$queryRawUnsafe(
    `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 AND r.is_approved = 1 ORDER BY r.created_at DESC`,
    productId
  );
  return NextResponse.json({ reviews: rows });
}

const postSchema = z.object({
  productId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  const { productId, orderId, rating, title, body: reviewBody } = parsed.data;
  const orders = await prisma.orders.findMany({
    where: { user_id: user.userId, status: "delivered" },
    select: { id: true, items: true },
  });

  let ok = false;
  for (const o of orders) {
    const items = parseJsonArray<{ productId: string }>(o.items, []);
    if (items.some((i) => i.productId === productId)) {
      ok = true;
      break;
    }
  }
  if (!ok) {
    return NextResponse.json({ error: "Verified purchase required" }, { status: 403 });
  }

  const id = nanoid();
  await prisma.reviews.create({
    data: {
      id,
      product_id: productId,
      user_id: user.userId,
      order_id: orderId ?? null,
      rating,
      title: title ?? null,
      body: reviewBody,
      is_verified: 1,
      is_approved: 0,
    },
  });
  return NextResponse.json({ id, pending: true });
}
