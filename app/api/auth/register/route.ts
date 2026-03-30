import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { attributeRegistration } from "@/lib/referral";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
  referralCode: z.string().min(4).max(32).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password, name, referralCode } = parsed.data;
  const exists = await prisma.users.findFirst({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const id = nanoid();
  const referral_code = nanoid(10);
  const hash = hashPassword(password);
  const welcomePoints = 500;

  const lt = nanoid();
  const seq = nanoid();
  await prisma.$transaction([
    prisma.users.create({
      data: {
        id,
        email: email.toLowerCase(),
        name: name ?? null,
        password_hash: hash,
        role: "customer",
        loyalty_points: welcomePoints,
        referral_code,
        email_consent: 1,
      },
    }),
    prisma.loyalty_transactions.create({
      data: { id: lt, user_id: id, points: welcomePoints, reason: "signup_bonus", order_id: null },
    }),
    prisma.email_sequences.create({
      data: { id: seq, user_id: id, sequence_type: "welcome", current_step: 0, completed: 0 },
    }),
  ]);

  if (referralCode) {
    await attributeRegistration(id, referralCode);
  }

  const token = signToken({ userId: id, email: email.toLowerCase(), role: "customer" });
  await setAuthCookie(token);

  void sendWelcomeEmail({
    email: email.toLowerCase(),
    name: name ?? "Researcher",
    referralCode: referral_code,
  });

  const user = {
    id,
    email: email.toLowerCase(),
    name: name ?? "",
    role: "customer" as const,
    loyaltyPoints: welcomePoints,
    referralCode: referral_code,
  };

  return NextResponse.json({ user, token });
}
