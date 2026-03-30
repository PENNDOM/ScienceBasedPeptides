import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.orders.findMany({
    where: { user_id: user.userId },
    orderBy: { created_at: "desc" },
    take: 10,
    select: { id: true, total: true, status: true, created_at: true },
  });
  return NextResponse.json({ orders });
}
