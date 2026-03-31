import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codeSuffix = customAlphabet(CODE_ALPHABET, 6);
const FIRST_ORDER_COMMISSION_RATE = 0.2;
const QUALIFYING_ORDER_STATUSES = ["confirmed", "processing", "shipped", "delivered"] as const;

async function ensureReferralCode(userId: string, existingCode: string | null): Promise<string> {
  if (existingCode && existingCode.trim().length > 0) return existingCode;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = `SBP-${codeSuffix()}`;
    try {
      await prisma.users.update({
        where: { id: userId },
        data: { referral_code: candidate },
      });
      return candidate;
    } catch (error) {
      const message = String(error).toLowerCase();
      if (message.includes("unique") || message.includes("referral_code")) continue;
      throw error;
    }
  }

  throw new Error("Could not generate unique referral code");
}

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findFirst({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
      referral_code: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referralCode = await ensureReferralCode(user.id, user.referral_code);

  const [orders, clicks, referrals] = await Promise.all([
    prisma.orders.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { id: true, status: true, total: true, created_at: true },
    }),
    prisma.referrals.count({ where: { referrer_id: user.id } }),
    prisma.referrals.findMany({
      where: { referrer_id: user.id, referred_user_id: { not: null } },
      select: { referred_user_id: true },
    }),
  ]);

  const referredUserIds = Array.from(
    new Set(
      referrals
        .map((row) => row.referred_user_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const totalReferrals = referredUserIds.length;

  let conversions = 0;
  let referredOrders = 0;
  let estimatedCommissions = 0;

  if (referredUserIds.length > 0) {
    const [qualifiedOrdersCount, qualifiedOrders] = await Promise.all([
      prisma.orders.count({
        where: { user_id: { in: referredUserIds }, status: { in: [...QUALIFYING_ORDER_STATUSES] } },
      }),
      prisma.orders.findMany({
        where: { user_id: { in: referredUserIds }, status: { in: [...QUALIFYING_ORDER_STATUSES] } },
        select: { user_id: true, total: true, created_at: true },
        orderBy: [{ user_id: "asc" }, { created_at: "asc" }],
      }),
    ]);

    referredOrders = qualifiedOrdersCount;

    const firstOrderByUser = new Map<string, number>();
    for (const order of qualifiedOrders) {
      if (!order.user_id || firstOrderByUser.has(order.user_id)) continue;
      firstOrderByUser.set(order.user_id, Number(order.total));
    }

    conversions = firstOrderByUser.size;
    let firstOrderTotal = 0;
    for (const orderTotal of firstOrderByUser.values()) {
      firstOrderTotal += orderTotal;
    }
    estimatedCommissions = Number((firstOrderTotal * FIRST_ORDER_COMMISSION_RATE).toFixed(2));
  }

  return NextResponse.json({
    account: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      role: user.role,
      createdAt: Number(user.created_at),
      status: "Active",
      referralCode,
    },
    orders: orders.map((o) => ({
      ...o,
      created_at: Number(o.created_at),
    })),
    referralPerformance: {
      totalReferrals,
      clicks,
      conversions,
      referredOrders,
      estimatedCommissions,
    },
  });
}
