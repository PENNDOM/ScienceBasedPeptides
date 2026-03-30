import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const REVIEW_POINTS = 1000;

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const r = await prisma.reviews.findFirst({ where: { id }, select: { user_id: true } });
  if (!r) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.reviews.update({ where: { id }, data: { is_approved: 1, is_verified: 1 } });
  await prisma.users.update({ where: { id: r.user_id }, data: { loyalty_points: { increment: REVIEW_POINTS } } });
  const tid = nanoid();
  await prisma.loyalty_transactions.create({
    data: { id: tid, user_id: r.user_id, points: REVIEW_POINTS, reason: "review_approved", order_id: null },
  });
  return NextResponse.json({ ok: true });
}
