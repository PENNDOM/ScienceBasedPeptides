import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createReferralClick } from "@/lib/referral";

const schema = z.object({
  code: z.string().min(4),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const ref = await prisma.users.findFirst({
    where: { referral_code: parsed.data.code },
    select: { id: true },
  });
  if (!ref) {
    return NextResponse.json({ ok: true });
  }
  const clickId = await createReferralClick(ref.id, parsed.data.email);
  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set("peptide_ref_code", parsed.data.code, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  res.cookies.set("peptide_ref_click_id", clickId, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
