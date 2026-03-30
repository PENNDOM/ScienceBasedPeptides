import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import {
  sendCartAbandonmentEmail,
  sendLowStockAlertEmail,
  sendRestockReminderEmail,
  sendWinBackEmail,
} from "@/lib/email";
export async function processEmailSequences(): Promise<{ sent: number }> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await prisma.email_sequences.findMany({
    where: { completed: 0, OR: [{ last_sent_at: null }, { last_sent_at: { lt: now - 3600 } }] },
    select: { id: true, user_id: true, sequence_type: true, reference_id: true, current_step: true },
  });

  let sent = 0;
  for (const seq of rows) {
    const user = await prisma.users.findFirst({
      where: { id: seq.user_id },
      select: { email: true, name: true },
    });
    if (!user) continue;
    if (seq.sequence_type === "cart_abandonment") {
      const cart = await prisma.abandoned_carts.findFirst({
        where: { user_id: seq.user_id },
        orderBy: { last_updated: "desc" },
        select: { cart_data: true },
      });
      if (!cart) continue;
      const data = JSON.parse(cart.cart_data) as {
        items: Array<{ name: string; size: string; quantity: number; price: number }>;
      };
      void sendCartAbandonmentEmail(seq.current_step, {
        email: user.email,
        name: user.name ?? "",
        cartItems: data.items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        discountCode: "CART10",
      });
      await prisma.email_sequences.update({
        where: { id: seq.id },
        data: { current_step: { increment: 1 }, last_sent_at: now },
      });
      sent++;
    }
    if (seq.sequence_type === "win_back") {
      void sendWinBackEmail(seq.current_step, {
        email: user.email,
        name: user.name ?? "",
        discountCode: "WINBACK15",
      });
      await prisma.email_sequences.update({
        where: { id: seq.id },
        data: { current_step: { increment: 1 }, last_sent_at: now },
      });
      sent++;
    }
    if (seq.sequence_type === "restock_reminder" && seq.reference_id) {
      const p = await prisma.products.findFirst({
        where: { id: seq.reference_id },
        select: { name: true, slug: true, cycle_length_days: true },
      });
      if (!p) continue;
      void sendRestockReminderEmail({
        email: user.email,
        name: user.name ?? "",
        productName: p.name,
        productSlug: p.slug,
        daysLeft: Math.max(1, (p.cycle_length_days ?? 30) - 7),
      });
      await prisma.email_sequences.update({ where: { id: seq.id }, data: { completed: 1, last_sent_at: now } });
      sent++;
    }
  }
  return { sent };
}

export async function expireInactiveLoyalty(): Promise<{ expiredUsers: number }> {
  const yearAgo = Math.floor(Date.now() / 1000) - 365 * 86400;
  const users = await prisma.users.findMany({
    where: { loyalty_points: { gt: 0 }, OR: [{ last_purchase_at: null }, { last_purchase_at: { lt: yearAgo } }] },
    select: { id: true, loyalty_points: true },
  });

  let expiredUsers = 0;
  for (const u of users) {
    const pts = u.loyalty_points;
    if (pts <= 0) continue;
    await prisma.users.update({ where: { id: u.id }, data: { loyalty_points: 0 } });
    const tid = nanoid();
    await prisma.loyalty_transactions.create({
      data: { id: tid, user_id: u.id, points: -pts, reason: "inactivity_expiry", order_id: null },
    });
    expiredUsers++;
  }
  return { expiredUsers };
}

export async function alertLowStock(adminEmail: string | undefined): Promise<{ lines: string[] }> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT v.sku, v.stock_qty, v.low_stock_threshold, p.name
     FROM variants v JOIN products p ON p.id = v.product_id
     WHERE v.stock_qty < v.low_stock_threshold`
  )) as Array<{ sku: string; stock_qty: number; low_stock_threshold: number; name: string }>;

  const lines = rows.map((r) => `${r.name} (${r.sku}): ${r.stock_qty} left (threshold ${r.low_stock_threshold})`);
  if (lines.length && adminEmail) {
    void sendLowStockAlertEmail(adminEmail, lines);
  }
  return { lines };
}

export async function createSubscriptionOrdersDue(): Promise<{ created: number }> {
  const now = Math.floor(Date.now() / 1000);
  const subs = await prisma.subscriptions.findMany({
    where: {
      status: "active",
      next_billing_date: { lte: now },
      OR: [{ paused_until: null }, { paused_until: { lte: now } }],
    },
    select: { id: true, user_id: true, interval_days: true, discount_percent: true },
  });

  let created = 0;
  for (const s of subs) {
    const items = await prisma.subscription_items.findMany({
      where: { subscription_id: s.id },
      select: { product_id: true, variant_id: true, quantity: true, unit_price: true },
    });
    if (!items.length) continue;
    const orderId = nanoid();
    const lineItems = [];
    let subtotal = 0;
    for (const it of items) {
      const price = it.unit_price * (1 - s.discount_percent);
      subtotal += price * it.quantity;
      const p = await prisma.products.findFirst({ where: { id: it.product_id }, select: { name: true, slug: true } });
      const v = await prisma.variants.findFirst({ where: { id: it.variant_id }, select: { size: true } });
      if (!p || !v) continue;
      lineItems.push({
        productId: it.product_id,
        variantId: it.variant_id,
        name: p.name,
        slug: p.slug,
        size: v.size,
        quantity: it.quantity,
        unitPrice: price,
      });
    }
    const shipping = subtotal >= 150 ? 0 : 9.99;
    const total = subtotal + shipping;
    const user = await prisma.users.findFirst({ where: { id: s.user_id }, select: { email: true } });
    if (!user) continue;
    await prisma.orders.create({
      data: {
        id: orderId,
        user_id: s.user_id,
        guest_email: user.email,
        status: "pending_payment",
        items: JSON.stringify(lineItems),
        subtotal,
        discount_amount: 0,
        shipping_cost: shipping,
        tax: 0,
        total,
        shipping_address: JSON.stringify({ label: "subscription" }),
        is_subscription_order: 1,
        loyalty_points_earned: 0,
        loyalty_points_used: 0,
      },
    });
    await prisma.subscriptions.update({
      where: { id: s.id },
      data: { next_billing_date: { increment: s.interval_days * 86400 } },
    });
    created++;
  }
  return { created };
}

export async function startAbandonmentForStaleCarts(): Promise<{ started: number }> {
  const now = Math.floor(Date.now() / 1000);
  const stale = await prisma.abandoned_carts.findMany({
    where: { recovered: 0, last_updated: { lt: now - 3600 }, email_step: 0 },
    select: { id: true, user_id: true },
  });

  let started = 0;
  for (const c of stale) {
    if (!c.user_id) continue;
    const exists = await prisma.email_sequences.findFirst({
      where: { user_id: c.user_id, sequence_type: "cart_abandonment", completed: 0 },
      select: { id: true },
    });
    if (exists) continue;
    const sid = nanoid();
    await prisma.email_sequences.create({
      data: {
        id: sid,
        user_id: c.user_id,
        sequence_type: "cart_abandonment",
        reference_id: c.id,
        current_step: 0,
        last_sent_at: null,
        completed: 0,
      },
    });
    started++;
  }
  return { started };
}

export async function scheduleWinBackForInactiveUsers(): Promise<{ scheduled: number }> {
  const now = Math.floor(Date.now() / 1000);
  const thresholds = [60, 90, 120];
  let scheduled = 0;
  for (let i = 0; i < thresholds.length; i++) {
    const days = thresholds[i];
    const since = now - days * 86400;
    const users = await prisma.users.findMany({
      where: {
        role: "customer",
        email_consent: 1,
        OR: [{ last_purchase_at: null }, { last_purchase_at: { lt: since } }],
      },
      select: { id: true },
    });

    for (const u of users) {
      const dup = await prisma.email_sequences.findFirst({
        where: { user_id: u.id, sequence_type: "win_back", completed: 0 },
        select: { id: true },
      });
      if (dup) continue;
      const sid = nanoid();
      await prisma.email_sequences.create({
        data: {
          id: sid,
          user_id: u.id,
          sequence_type: "win_back",
          current_step: i,
          last_sent_at: null,
          completed: 0,
        },
      });
      scheduled++;
    }
  }
  return { scheduled };
}
