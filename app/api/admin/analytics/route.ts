import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";

interface LineSnap {
  productId?: string;
  quantity?: number;
  price?: number;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const startToday = now - (now % day);
  const startWeek = startToday - 6 * day;
  const startMonth = now - 30 * day;
  const start30 = now - 30 * day;

  const revenue = (from: number) =>
    prisma
      .$queryRawUnsafe<{ s: number }[]>(
        `SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status NOT IN ('cancelled', 'refunded', 'pending_payment') AND created_at >= $1`,
        from
      )
      .then((r) => Number(r[0]?.s ?? 0));

  const byStatus = (await prisma.$queryRawUnsafe(`SELECT status, COUNT(*) as c FROM orders GROUP BY status`)) as Array<{
    status: string;
    c: number;
  }>;

  const aovAllRow = (await prisma.$queryRawUnsafe<{ a: number | null }[]>(
    `SELECT AVG(total) as a FROM orders WHERE status NOT IN ('cancelled', 'refunded', 'pending_payment')`
  ))[0];
  const aovAll = aovAllRow?.a ?? 0;

  const aov30Row = (await prisma.$queryRawUnsafe<{ a: number | null }[]>(
    `SELECT AVG(total) as a FROM orders WHERE status NOT IN ('cancelled', 'refunded', 'pending_payment') AND created_at >= $1`,
    start30
  ))[0];
  const aov30 = aov30Row?.a ?? 0;

  const repeat = (await prisma.$queryRawUnsafe<{ u: number }[]>(
    `SELECT COUNT(DISTINCT user_id) as u FROM orders WHERE user_id IS NOT NULL`
  ))[0];
  const multi = (await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*) as c FROM (SELECT user_id FROM orders WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) >= 2)`
  ))[0];
  const repeatRate = (repeat?.u ?? 0) > 0 ? (multi?.c ?? 0) / (repeat?.u ?? 1) : 0;

  const orderRows = (await prisma.$queryRawUnsafe(
    `SELECT items FROM orders WHERE status NOT IN ('cancelled', 'refunded', 'pending_payment')`
  )) as Array<{ items: string }>;
  const productRev = new Map<string, number>();
  const productUnits = new Map<string, number>();
  for (const o of orderRows) {
    const lines = parseJsonArray<LineSnap>(o.items, []);
    for (const line of lines) {
      const pid = line.productId;
      if (!pid) continue;
      const q = line.quantity ?? 0;
      const p = line.price ?? 0;
      productRev.set(pid, (productRev.get(pid) ?? 0) + q * p);
      productUnits.set(pid, (productUnits.get(pid) ?? 0) + q);
    }
  }
  const topByRev = [...productRev.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId, revenueVal]) => {
      return { productId, name: productId, revenue: revenueVal, units: productUnits.get(productId) ?? 0 };
    });
  const productNames = await prisma.products.findMany({
    where: { id: { in: topByRev.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const productNameMap = new Map(productNames.map((p) => [p.id, p.name]));
  for (const p of topByRev) {
    p.name = productNameMap.get(p.productId) ?? p.productId;
  }

  const activeSubs = (await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'`
  ))[0];
  const avgSub = (await prisma.$queryRawUnsafe<{ m: number | null }[]>(
    `SELECT AVG(si.quantity * si.unit_price * (1 - s.discount_percent)) as m
     FROM subscription_items si JOIN subscriptions s ON s.id = si.subscription_id WHERE s.status = 'active'`
  ))[0];
  const mrr = Number(activeSubs?.c ?? 0) * Number(avgSub?.m ?? 0);

  const newCustomers = (await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*) as c FROM users WHERE role = 'customer' AND created_at >= $1`,
    start30
  ))[0];

  const pointsOutstanding = (await prisma.$queryRawUnsafe<{ s: number | null }[]>(
    `SELECT SUM(loyalty_points) as s FROM users`
  ))[0];

  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const dayStart = startToday - (29 - i) * day;
    const dayEnd = dayStart + day;
    return prisma
      .$queryRawUnsafe<{ s: number }[]>(
        `SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= $1 AND created_at < $2 AND status NOT IN ('cancelled','refunded','pending_payment')`,
        dayStart,
        dayEnd
      )
      .then((res) => ({ day: dayStart, revenue: Number(res[0]?.s ?? 0) }));
  });
  const [todayRevenue, weekRevenue, monthRevenue, allRevenue] = await Promise.all([
    revenue(startToday),
    revenue(startWeek),
    revenue(startMonth),
    revenue(0),
  ]);
  const revenue30Resolved = await Promise.all(last30Days);

  return NextResponse.json({
    revenue: {
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      allTime: allRevenue,
    },
    ordersByStatus: byStatus,
    aov: { allTime: aovAll, last30Days: aov30 },
    repeatPurchaseRate: repeatRate,
    topProducts: topByRev,
    subscriptionMRR: mrr,
    newCustomersLast30: Number(newCustomers?.c ?? 0),
    loyaltyPointsOutstanding: Number(pointsOutstanding?.s ?? 0),
    revenueLast30Days: revenue30Resolved,
  });
}
