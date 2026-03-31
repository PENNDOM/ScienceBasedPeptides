import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const QUALIFYING_ORDER_STATUSES = ["confirmed", "processing", "shipped", "delivered"] as const;
const FIRST_ORDER_COMMISSION_RATE = 0.2;

async function ensureMarketingEventsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS marketing_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      source TEXT,
      path TEXT,
      session_key TEXT,
      created_at BIGINT NOT NULL
    );
  `);
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") || "30")));
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  await ensureMarketingEventsTable();

  const [newsletterTotals, marketingOpens, referralBase] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT
         COUNT(*) FILTER (WHERE consent = 1) AS active_subscribers,
         COUNT(*) AS total_subscriber_rows
       FROM newsletter_signups`
    ) as Promise<Array<{ active_subscribers: number; total_subscriber_rows: number }>>,
    prisma.$queryRawUnsafe(
      `SELECT
         COUNT(*) FILTER (WHERE source = 'organic_site_open') AS organic_open_events,
         COUNT(DISTINCT session_key) FILTER (WHERE source = 'organic_site_open') AS organic_open_sessions,
         COUNT(*) FILTER (WHERE source = 'referral_link') AS referral_open_events,
         COUNT(DISTINCT session_key) FILTER (WHERE source = 'referral_link') AS referral_open_sessions
       FROM marketing_events
       WHERE created_at >= $1`,
      since
    ) as Promise<
      Array<{
        organic_open_events: number;
        organic_open_sessions: number;
        referral_open_events: number;
        referral_open_sessions: number;
      }>
    >,
    prisma.$queryRawUnsafe(
      `SELECT
        COUNT(*) AS affiliate_clicks,
        COUNT(DISTINCT referred_user_id) FILTER (WHERE referred_user_id IS NOT NULL) AS total_referrals
       FROM referrals`
    ) as Promise<Array<{ affiliate_clicks: number; total_referrals: number }>>,
  ]);

  const referredUsers = await prisma.referrals.findMany({
    where: { referred_user_id: { not: null } },
    select: { referred_user_id: true },
  });
  const referredUserIds = Array.from(
    new Set(referredUsers.map((r) => r.referred_user_id).filter((id): id is string => Boolean(id)))
  );

  let conversions = 0;
  let referredOrders = 0;
  let estimatedCommissions = 0;
  if (referredUserIds.length > 0) {
    const [qualifiedOrdersCount, qualifiedOrders] = await Promise.all([
      prisma.orders.count({
        where: {
          user_id: { in: referredUserIds },
          status: { in: [...QUALIFYING_ORDER_STATUSES] },
        },
      }),
      prisma.orders.findMany({
        where: {
          user_id: { in: referredUserIds },
          status: { in: [...QUALIFYING_ORDER_STATUSES] },
        },
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
    let sum = 0;
    for (const total of firstOrderByUser.values()) sum += total;
    estimatedCommissions = Number((sum * FIRST_ORDER_COMMISSION_RATE).toFixed(2));
  }

  return NextResponse.json({
    windowDays: days,
    newsletter: {
      activeSubscribers: Number(newsletterTotals[0]?.active_subscribers ?? 0),
      totalRows: Number(newsletterTotals[0]?.total_subscriber_rows ?? 0),
    },
    organic: {
      openEvents: Number(marketingOpens[0]?.organic_open_events ?? 0),
      uniqueSessions: Number(marketingOpens[0]?.organic_open_sessions ?? 0),
    },
    referralLinkOpens: {
      openEvents: Number(marketingOpens[0]?.referral_open_events ?? 0),
      uniqueSessions: Number(marketingOpens[0]?.referral_open_sessions ?? 0),
    },
    affiliate: {
      clicks: Number(referralBase[0]?.affiliate_clicks ?? 0),
      totalReferrals: Number(referralBase[0]?.total_referrals ?? 0),
      conversions,
      referredOrders,
      estimatedFirstOrderCommissions: estimatedCommissions,
    },
  });
}

