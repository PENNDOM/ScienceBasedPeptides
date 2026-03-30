import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const jwt = await getCurrentUser();
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const row = await prisma.users.findFirst({
    where: { id: jwt.userId },
    select: { id: true, email: true, name: true, role: true, loyalty_points: true, referral_code: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: row.id,
      email: row.email,
      name: row.name ?? "",
      role: row.role === "admin" ? "admin" : "customer",
      loyaltyPoints: row.loyalty_points,
      referralCode: row.referral_code,
    },
  });
}
