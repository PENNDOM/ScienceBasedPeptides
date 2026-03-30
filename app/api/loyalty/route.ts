import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const u = await prisma.users.findFirst({ where: { id: user.userId }, select: { loyalty_points: true } });
  const history = await prisma.loyalty_transactions.findMany({
    where: { user_id: user.userId },
    orderBy: { created_at: "desc" },
    take: 200,
  });
  return NextResponse.json({ balance: u?.loyalty_points ?? 0, history });
}
