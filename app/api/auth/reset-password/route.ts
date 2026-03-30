import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { token, password } = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  const users = await prisma.users.findMany({
    where: { reset_token: { not: null } },
    select: { id: true, reset_token: true, reset_token_expires: true },
  });

  let match: string | null = null;
  for (const u of users) {
    if (!u.reset_token || !u.reset_token_expires || u.reset_token_expires < now) continue;
    if (bcrypt.compareSync(token, u.reset_token)) {
      match = u.id;
      break;
    }
  }
  if (!match) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.users.update({
    where: { id: match },
    data: {
      password_hash: hashPassword(password),
      reset_token: null,
      reset_token_expires: null,
    },
  });
  return NextResponse.json({ ok: true });
}
