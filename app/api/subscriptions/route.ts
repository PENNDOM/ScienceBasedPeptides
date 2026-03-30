import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await prisma.subscriptions.findMany({
    where: { user_id: user.userId },
    orderBy: { created_at: "desc" },
  });
  const items = await prisma.subscription_items.findMany({
    where: { subscription_id: { in: subs.map((s) => s.id) } },
  });
  const itemMap = new Map<string, Array<Record<string, unknown>>>();
  for (const item of items) {
    const list = itemMap.get(item.subscription_id) ?? [];
    list.push(item as unknown as Record<string, unknown>);
    itemMap.set(item.subscription_id, list);
  }
  const out = subs.map((s) => ({ ...s, items: itemMap.get(s.id) ?? [] }));
  return NextResponse.json({ subscriptions: out });
}

const postSchema = z.object({
  intervalDays: z.number().int().min(30).max(90),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const sid = nanoid();
  const nextBill = Math.floor(Date.now() / 1000) + parsed.data.intervalDays * 86400;
  await prisma.$transaction(async (tx) => {
    await tx.subscriptions.create({
      data: {
        id: sid,
        user_id: user.userId,
        status: "active",
        interval_days: parsed.data.intervalDays,
        next_billing_date: nextBill,
        discount_percent: 0.15,
      },
    });
    for (const it of parsed.data.items) {
      await tx.subscription_items.create({
        data: {
          id: nanoid(),
          subscription_id: sid,
          product_id: it.productId,
          variant_id: it.variantId,
          quantity: it.quantity,
          unit_price: it.unitPrice,
        },
      });
    }
  });
  return NextResponse.json({ id: sid });
}
