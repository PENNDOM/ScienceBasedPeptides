import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.users.findFirst({ where: { email }, select: { id: true } });
  if (user) {
    const raw = nanoid(48);
    const hash = bcrypt.hashSync(raw, 12);
    const exp = Math.floor(Date.now() / 1000) + 3600;
    await prisma.users.update({
      where: { id: user.id },
      data: { reset_token: hash, reset_token_expires: exp },
    });
    void sendPasswordResetEmail(email, raw);
  }
  return NextResponse.json({ ok: true });
}
