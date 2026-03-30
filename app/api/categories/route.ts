import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.categories.findMany({
    select: { id: true, name: true, slug: true, description: true, display_order: true },
    orderBy: { display_order: "asc" },
  });
  return NextResponse.json({ categories: rows });
}
