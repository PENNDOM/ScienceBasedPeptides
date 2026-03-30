import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await prisma.$queryRawUnsafe(
    `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.name`
  );
  return NextResponse.json({ products: rows });
}
