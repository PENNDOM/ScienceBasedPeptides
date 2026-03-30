import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const orders = await prisma.orders.findMany({
    orderBy: { created_at: "desc" },
    take: 500,
    select: { id: true, user_id: true, guest_email: true, status: true, total: true, created_at: true },
  });
  return NextResponse.json({ orders });
}
