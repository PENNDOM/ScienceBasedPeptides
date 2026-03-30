import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { awardPointsForOrder } from "@/lib/loyalty";
import { markReferralConverted } from "@/lib/referral";
import { sendOrderShippedEmail } from "@/lib/email";

const schema = z.object({
  status: z.enum(["confirmed", "processing", "shipped", "delivered"]).optional(),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
  trackingUrl: z.string().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const order = (await prisma.orders.findFirst({ where: { id } })) as
    | {
        id: string;
        user_id: string | null;
        status: string;
        total: number;
        is_subscription_order: number;
        loyalty_points_earned: number;
      }
    | undefined;
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = Math.floor(Date.now() / 1000);

  if (parsed.data.status === "confirmed" && order.status !== "confirmed") {
    await prisma.orders.update({ where: { id }, data: { status: "confirmed", confirmed_at: now } });
    if (order.user_id) {
      const pts = await awardPointsForOrder({
        userId: order.user_id,
        orderId: id,
        orderTotalUsd: order.total,
        isSubscription: Boolean(order.is_subscription_order),
      });
      await prisma.orders.update({ where: { id }, data: { loyalty_points_earned: pts } });
      await prisma.users.update({ where: { id: order.user_id }, data: { last_purchase_at: now } });
      await markReferralConverted(order.user_id);
    }
  }

  if (parsed.data.trackingNumber && parsed.data.trackingCarrier) {
    await prisma.orders.update({
      where: { id },
      data: {
        tracking_number: parsed.data.trackingNumber,
        tracking_carrier: parsed.data.trackingCarrier,
        tracking_url: parsed.data.trackingUrl ?? null,
        status: "shipped",
        shipped_at: now,
      },
    });
    const u = order.user_id
      ? await prisma.users.findFirst({ where: { id: order.user_id }, select: { email: true, name: true } })
      : null;
    if (u) {
      void sendOrderShippedEmail({
        email: u.email,
        name: u.name ?? "",
        orderId: id,
        trackingNumber: parsed.data.trackingNumber,
        trackingCarrier: parsed.data.trackingCarrier,
        trackingUrl: parsed.data.trackingUrl,
      });
    }
  }

  if (parsed.data.status === "delivered") {
    await prisma.orders.update({ where: { id }, data: { status: "delivered", delivered_at: now } });
  }

  return NextResponse.json({ ok: true });
}
