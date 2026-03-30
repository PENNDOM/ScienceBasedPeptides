import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const order = (await prisma.orders.findFirst({ where: { id } })) as Record<string, unknown> | undefined;
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = user?.userId && order.user_id === user.userId;
  const isAdmin = user?.role === "admin";
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      ...order,
      items: parseJsonArray(order.items as string, []),
      shippingAddress: JSON.parse((order.shipping_address as string) || "{}"),
    },
  });
}

const patchBody = z.object({
  cryptoTxHash: z.string().min(8).max(256).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const order = await prisma.orders.findFirst({ where: { id }, select: { user_id: true } });
  if (!order || order.user_id !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (parsed.data.cryptoTxHash) {
    await prisma.orders.update({
      where: { id },
      data: { crypto_tx_hash: parsed.data.cryptoTxHash, status: "awaiting_confirmation" },
    });
  }
  return NextResponse.json({ ok: true });
}
