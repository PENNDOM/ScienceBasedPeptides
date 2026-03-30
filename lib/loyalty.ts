import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export async function awardPointsForOrder(params: {
  userId: string;
  orderId: string;
  orderTotalUsd: number;
  isSubscription: boolean;
}): Promise<number> {
  const base = Math.floor(params.orderTotalUsd);
  const points = params.isSubscription ? base * 2 : base;
  const uid = nanoid();
  await prisma.users.update({
    where: { id: params.userId },
    data: { loyalty_points: { increment: points } },
  });
  await prisma.loyalty_transactions.create({
    data: { id: uid, user_id: params.userId, points, reason: "order_earned", order_id: params.orderId },
  });
  return points;
}

export async function redeemPoints(userId: string, points: number, reason: string): Promise<void> {
  const uid = nanoid();
  await prisma.users.update({
    where: { id: userId },
    data: { loyalty_points: { decrement: points } },
  });
  await prisma.loyalty_transactions.create({
    data: { id: uid, user_id: userId, points: -points, reason, order_id: null },
  });
}

export function minimumRedeemPoints(): number {
  return 500;
}

export function pointsToUsd(points: number): number {
  return points / 100;
}
