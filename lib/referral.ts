import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

const REFERRAL_POINTS_ON_CONVERT = 2000;

export async function createReferralClick(referrerId: string, referredEmail?: string): Promise<string> {
  const id = nanoid();
  await prisma.referrals.create({
    data: { id, referrer_id: referrerId, referred_email: referredEmail ?? null, status: "clicked" },
  });
  return id;
}

export async function attributeRegistration(
  referredUserId: string,
  referralCode: string,
  opts?: { referralClickId?: string | null }
): Promise<void> {
  const referrer = await prisma.users.findFirst({
    where: { referral_code: referralCode },
    select: { id: true },
  });
  if (!referrer) return;
  if (referrer.id === referredUserId) return;

  await prisma.users.update({
    where: { id: referredUserId },
    data: { referred_by_id: referrer.id },
  });

  const referralClickId = opts?.referralClickId?.trim();
  if (referralClickId) {
    const click = await prisma.referrals.findFirst({
      where: { id: referralClickId, referrer_id: referrer.id, referred_user_id: null },
      select: { id: true },
    });
    if (click) {
      await prisma.referrals.update({
        where: { id: click.id },
        data: { status: "registered", referred_user_id: referredUserId },
      });
      return;
    }
  }

  const latestUnclaimedReferral = await prisma.referrals.findFirst({
    where: { referrer_id: referrer.id, referred_user_id: null },
    orderBy: { created_at: "desc" },
    select: { id: true },
  });
  if (!latestUnclaimedReferral) return;
  await prisma.referrals.update({
    where: { id: latestUnclaimedReferral.id },
    data: { status: "registered", referred_user_id: referredUserId },
  });
}

export async function markReferralConverted(referredUserId: string): Promise<void> {
  const user = await prisma.users.findFirst({
    where: { id: referredUserId },
    select: { referred_by_id: true },
  });
  if (!user?.referred_by_id) return;
  const ref = await prisma.referrals.findFirst({
    where: { referred_user_id: referredUserId, NOT: { status: "converted" } },
    orderBy: { created_at: "desc" },
    select: { id: true },
  });
  if (!ref) return;
  await prisma.referrals.update({
    where: { id: ref.id },
    data: {
      status: "converted",
      converted_at: Math.floor(Date.now() / 1000),
      points_awarded: REFERRAL_POINTS_ON_CONVERT,
    },
  });
  await prisma.users.update({
    where: { id: user.referred_by_id },
    data: { loyalty_points: { increment: REFERRAL_POINTS_ON_CONVERT } },
  });
  const tid = nanoid();
  await prisma.loyalty_transactions.create({
    data: {
      id: tid,
      user_id: user.referred_by_id,
      points: REFERRAL_POINTS_ON_CONVERT,
      reason: "referral_conversion",
      order_id: null,
    },
  });
}
