import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const code = await prisma.users.findFirst({ where: { id: user.userId }, select: { referral_code: true } });
  const stats = (await prisma.$queryRawUnsafe(
    `SELECT status, COUNT(*) as c FROM referrals WHERE referrer_id = $1 GROUP BY status`,
    user.userId
  )) as Array<{ status: string; c: number }>;
  return NextResponse.json({ referralCode: code?.referral_code ?? "", stats });
}
