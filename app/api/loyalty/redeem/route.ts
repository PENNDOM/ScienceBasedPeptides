import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { minimumRedeemPoints, redeemPoints } from "@/lib/loyalty";

const schema = z.object({
  points: z.number().int().min(minimumRedeemPoints()),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: `Minimum ${minimumRedeemPoints()} points` }, { status: 400 });
  }
  const u = await prisma.users.findFirst({ where: { id: user.userId }, select: { loyalty_points: true } });
  if (!u || u.loyalty_points < parsed.data.points) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }
  await redeemPoints(user.userId, parsed.data.points, "manual_redeem");
  const next = await prisma.users.findFirst({ where: { id: user.userId }, select: { loyalty_points: true } });
  return NextResponse.json({ balance: next?.loyalty_points ?? 0 });
}
