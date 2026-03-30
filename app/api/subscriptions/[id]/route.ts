import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const patchSchema = z.object({
  intervalDays: z.number().int().optional(),
  pauseUntil: z.number().int().optional(),
  skipNext: z.boolean().optional(),
  swap: z
    .object({
      itemId: z.string(),
      variantId: z.string(),
    })
    .optional(),
  cancelReason: z.string().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const sub = (await prisma.subscriptions.findFirst({ where: { id, user_id: user.userId } })) as
    | Record<string, unknown>
    | undefined;
  if (!sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.intervalDays) {
    await prisma.subscriptions.update({ where: { id }, data: { interval_days: d.intervalDays } });
  }
  if (d.pauseUntil) {
    await prisma.subscriptions.update({ where: { id }, data: { status: "paused", paused_until: d.pauseUntil } });
  }
  if (d.skipNext) {
    const interval = sub.interval_days as number;
    await prisma.subscriptions.update({
      where: { id },
      data: { next_billing_date: { increment: interval * 86400 } },
    });
  }
  if (d.swap) {
    const v = await prisma.variants.findFirst({ where: { id: d.swap.variantId }, select: { price: true } });
    if (v) {
      await prisma.subscription_items.updateMany({
        where: { id: d.swap.itemId, subscription_id: id },
        data: { variant_id: d.swap.variantId, unit_price: v.price },
      });
    }
  }
  if (d.cancelReason) {
    await prisma.subscriptions.update({
      where: { id },
      data: { status: "cancelled", cancel_reason: d.cancelReason, cancelled_at: Math.floor(Date.now() / 1000) },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const sub = await prisma.subscriptions.findFirst({ where: { id, user_id: user.userId }, select: { id: true } });
  if (!sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.subscriptions.update({
    where: { id },
    data: { status: "cancelled", cancelled_at: Math.floor(Date.now() / 1000), cancel_reason: "user_cancelled" },
  });
  return NextResponse.json({ ok: true });
}
