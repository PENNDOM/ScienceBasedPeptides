import { NextResponse } from "next/server";
import {
  alertLowStock,
  createSubscriptionOrdersDue,
  expireInactiveLoyalty,
  processEmailSequences,
  scheduleWinBackForInactiveUsers,
  startAbandonmentForStaleCarts,
} from "@/lib/cron";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.ADMIN_EMAIL;

  const r1 = await processEmailSequences();
  const r2 = await createSubscriptionOrdersDue();
  const r3 = await scheduleWinBackForInactiveUsers();
  const r4 = await startAbandonmentForStaleCarts();
  const r5 = await alertLowStock(email);
  const r6 = await expireInactiveLoyalty();

  return NextResponse.json({
    ok: true,
    emailSequences: r1,
    subscriptionOrdersCreated: r2,
    winBackScheduled: r3,
    abandonmentStarted: r4,
    lowStockLines: r5.lines.length,
    loyaltyExpiredUsers: r6,
  });
}
