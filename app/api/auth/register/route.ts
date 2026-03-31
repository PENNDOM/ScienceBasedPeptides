import { NextResponse } from "next/server";
import { customAlphabet, nanoid } from "nanoid";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { attributeRegistration } from "@/lib/referral";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codeSuffix = customAlphabet(CODE_ALPHABET, 6);

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
  const cookieStore = await cookies();
  const referralCodeFromCookie = cookieStore.get("peptide_ref_code")?.value ?? "";
  const referralClickIdFromCookie = cookieStore.get("peptide_ref_click_id")?.value ?? "";
  const effectiveReferralCode = (referralCode?.trim() || referralCodeFromCookie.trim()) || undefined;
  const exists = await prisma.users.findFirst({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = hashPassword(password);
  const welcomePoints = 500;
  let id = "";
  let referral_code = "";

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidateId = nanoid();
    const candidateReferralCode = `SBP-${codeSuffix()}`;
    const lt = nanoid();
    const seq = nanoid();
    try {
      await prisma.$transaction([
        prisma.users.create({
          data: {
            id: candidateId,
            email: email.toLowerCase(),
            name: name ?? null,
            password_hash: hash,
            role: "customer",
            loyalty_points: welcomePoints,
            referral_code: candidateReferralCode,
            email_consent: 1,
          },
        }),
        prisma.loyalty_transactions.create({
          data: { id: lt, user_id: candidateId, points: welcomePoints, reason: "signup_bonus", order_id: null },
        }),
        prisma.email_sequences.create({
          data: { id: seq, user_id: candidateId, sequence_type: "welcome", current_step: 0, completed: 0 },
        }),
      ]);
      id = candidateId;
      referral_code = candidateReferralCode;
      break;
    } catch (error) {
      const msg = String(error);
      if (msg.includes("referral_code") || msg.toLowerCase().includes("unique")) {
        continue;
      }
      throw error;
    }
  }

  if (!id || !referral_code) {
    return NextResponse.json({ error: "Could not create account at this time" }, { status: 500 });
  }

  if (effectiveReferralCode) {
    await attributeRegistration(id, effectiveReferralCode, {
      referralClickId: referralClickIdFromCookie || null,
    });
  }

  cookieStore.delete("peptide_ref_code");
  cookieStore.delete("peptide_ref_click_id");

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
