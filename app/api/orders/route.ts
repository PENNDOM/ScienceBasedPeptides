import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import getDb from "@/db/index";
import { getCurrentUser } from "@/lib/auth";
import { calculateTotals, type CartItem } from "@/lib/cart";
import { calculateCryptoAmount, getCryptoOptions } from "@/lib/crypto-payment";
import { sendOrderConfirmationEmail } from "@/lib/email";
const lineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
  size: z.string(),
  price: z.number(),
  image: z.string().optional(),
  subscriptionEligible: z.boolean().optional(),
});

const schema = z.object({
  items: z.array(lineSchema),
  discount: z
    .object({ code: z.string(), type: z.string(), value: z.number() })
    .nullable()
    .optional(),
  loyaltyPointsToRedeem: z.number().min(0).optional(),
  isSubscription: z.boolean().optional(),
  guestEmail: z.string().email().optional(),
  shippingAddress: z.record(z.string(), z.unknown()),
  cryptoSymbol: z.string().min(2),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const d = parsed.data;
  const email = user?.email ?? d.guestEmail;
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const db = getDb();
  const items: CartItem[] = [];
  for (const line of d.items) {
    const v = db
      .prepare(`SELECT v.*, p.name, p.slug, p.images, p.subscription_eligible FROM variants v JOIN products p ON p.id = v.product_id WHERE v.id = ? AND p.id = ?`)
      .get(line.variantId, line.productId) as
      | {
          stock_qty: number;
          price: number;
          size: string;
          name: string;
          slug: string;
          images: string;
          subscription_eligible: number;
        }
      | undefined;
    if (!v || v.stock_qty < line.quantity) {
      return NextResponse.json({ error: `Stock issue: ${line.name}` }, { status: 400 });
    }
    let imgs: string[] = [];
    try {
      imgs = JSON.parse(v.images) as string[];
    } catch {
      imgs = [];
    }
    items.push({
      productId: line.productId,
      variantId: line.variantId,
      name: v.name,
      slug: v.slug,
      size: v.size,
      price: v.price,
      image: line.image ?? imgs[0] ?? "/placeholder-peptide.svg",
      quantity: line.quantity,
      subscriptionEligible: Boolean(v.subscription_eligible),
    });
  }

  let loyaltyRedeem = d.loyaltyPointsToRedeem ?? 0;
  if (user && loyaltyRedeem > 0) {
    const urow = db.prepare(`SELECT loyalty_points FROM users WHERE id = ?`).get(user.userId) as
      | { loyalty_points: number }
      | undefined;
    if (!urow || urow.loyalty_points < loyaltyRedeem) {
      return NextResponse.json({ error: "Insufficient loyalty points" }, { status: 400 });
    }
  } else if (!user) {
    loyaltyRedeem = 0;
  }

  const totals = calculateTotals(items, d.discount ?? null, loyaltyRedeem, d.isSubscription ?? false);
  const options = getCryptoOptions();
  const crypto = options.find((o) => o.symbol === d.cryptoSymbol) ?? options[0];
  const cryptoAmount = await calculateCryptoAmount(totals.total, crypto.symbol);

  const orderId = nanoid();
  const snapshot = items.map((i) => ({
    ...i,
    unitPrice: i.price,
  }));
  const shippingJson = JSON.stringify(d.shippingAddress);

  db.prepare(
    `INSERT INTO orders (
      id, user_id, guest_email, status, items, subtotal, discount_amount, discount_code,
      shipping_cost, tax, total, shipping_address,
      is_subscription_order, loyalty_points_earned, loyalty_points_used,
      crypto_currency, crypto_amount, crypto_wallet_sent_to
    ) VALUES (?, ?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    orderId,
    user?.userId ?? null,
    user ? null : email,
    JSON.stringify(snapshot),
    totals.subtotal,
    totals.discountAmount + totals.loyaltyDiscount,
    totals.discountCode,
    totals.shippingCost,
    totals.tax,
    totals.total,
    shippingJson,
    d.isSubscription ? 1 : 0,
    totals.pointsToEarn,
    loyaltyRedeem,
    crypto.symbol,
    cryptoAmount,
    crypto.walletAddress
  );

  if (user && loyaltyRedeem > 0) {
    db.prepare(`UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?`).run(loyaltyRedeem, user.userId);
    const tid = nanoid();
    db.prepare(
      `INSERT INTO loyalty_transactions (id, user_id, points, reason, order_id) VALUES (?, ?, ?, 'redeem_checkout', ?)`
    ).run(tid, user.userId, -loyaltyRedeem, orderId);
  }

  for (const line of items) {
    db.prepare(`UPDATE variants SET stock_qty = stock_qty - ? WHERE id = ?`).run(line.quantity, line.variantId);
    db.prepare(`UPDATE products SET sold_count = sold_count + ? WHERE id = ?`).run(line.quantity, line.productId);
  }

  if (user) {
    const seq = nanoid();
    db.prepare(
      `INSERT INTO email_sequences (id, user_id, sequence_type, reference_id, current_step) VALUES (?, ?, 'post_purchase', ?, 0)`
    ).run(seq, user.userId, orderId);
    const ac = nanoid();
    db.prepare(
      `INSERT INTO abandoned_carts (id, user_id, cart_data, recovered) VALUES (?, ?, ?, 1)`
    ).run(ac, user.userId, JSON.stringify({ items: [] }));
  }

  const displayName =
    (d.shippingAddress.fullName as string) ||
    (d.shippingAddress.name as string) ||
    email.split("@")[0];

  void sendOrderConfirmationEmail({
    id: orderId,
    email,
    name: displayName,
    items: snapshot.map((i) => ({
      name: i.name,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount + totals.loyaltyDiscount,
    shippingCost: totals.shippingCost,
    total: totals.total,
    cryptoCurrency: crypto.symbol,
    cryptoAmount,
    cryptoWalletSentTo: crypto.walletAddress,
  });

  return NextResponse.json({
    order: {
      id: orderId,
      status: "pending_payment",
      total: totals.total,
      cryptoCurrency: crypto.symbol,
      cryptoAmount,
      walletAddress: crypto.walletAddress,
      pointsEarned: totals.pointsToEarn,
    },
  });
}
