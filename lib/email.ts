import nodemailer from "nodemailer";
import { RESEARCH_USE_DISCLAIMER } from "@/lib/compliance";
import { DEFAULT_SITE_DISPLAY_NAME, DEFAULT_SITE_URL, DEFAULT_SUPPORT_EMAIL } from "@/lib/site";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_DISPLAY_NAME;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL;
const FROM = SUPPORT_EMAIL;

async function send(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL SKIPPED - no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  await getTransporter().sendMail({ from: FROM, to, subject, html, replyTo: SUPPORT_EMAIL });
}

function layout(content: string): string {
  return `
  <!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrap { max-width: 580px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #0a0d0f; padding: 28px 36px; }
    .header h1 { color: #00C9A7; margin: 0; font-size: 22px; }
    .body { padding: 36px; color: #333; line-height: 1.6; }
    .btn { display: inline-block; background: #00C9A7; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px 36px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    table.items { width: 100%; border-collapse: collapse; }
    table.items td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  </style></head><body>
  <div class="wrap">
    <div class="header"><h1>${SITE_NAME}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>${RESEARCH_USE_DISCLAIMER}</p>
      <p>${SITE_NAME} · <a href="${SITE_URL}">${SITE_URL}</a></p>
      <p><a href="${SITE_URL}/privacy">Privacy Policy</a></p>
    </div>
  </div></body></html>`;
}

export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
  referralCode: string;
}) {
  await send(
    user.email,
    `Welcome to ${SITE_NAME}`,
    layout(`
    <h2>Welcome, ${user.name || "Colleague"}!</h2>
    <p>Your research account is active. You can:</p>
    <ul>
      <li><strong>500 loyalty points</strong> credited at registration</li>
      <li>Track laboratory material orders and documentation in one place</li>
      <li>Opt into recurring shipment pricing on eligible catalog items where offered</li>
      <li>Earn <strong>2,000 points</strong> per qualified referral (see program terms)</li>
    </ul>
    <a class="btn" href="${SITE_URL}/shop">Browse catalog</a>
    <hr class="divider">
    <p><strong>Referral link:</strong><br>
    <code>${SITE_URL}/ref/${user.referralCode}</code><br>
    Share with qualified institutions or colleagues; referral discounts and points apply per current program rules.</p>
  `)
  );
}

export async function sendOrderConfirmationEmail(order: {
  id: string;
  email: string;
  name: string;
  items: Array<{ name: string; size: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  cryptoCurrency: string;
  cryptoAmount: number;
  cryptoWalletSentTo: string;
}) {
  const itemRows = order.items
    .map(
      (i) => `
    <tr>
      <td>${i.name} (${i.size}) × ${i.quantity}</td>
      <td style="text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  await send(
    order.email,
    `Order Received — #${order.id.slice(0, 8).toUpperCase()}`,
    layout(`
    <h2>Order received</h2>
    <p>Hi ${order.name || "Colleague"}, we have recorded your laboratory material order. Fulfillment proceeds after cryptocurrency payment is confirmed.</p>
    <h3>Payment Instructions</h3>
    <div style="background:#f0fdf9;border:1px solid #00C9A7;border-radius:6px;padding:18px;margin:16px 0;">
      <p><strong>Send exactly:</strong> <code>${order.cryptoAmount} ${order.cryptoCurrency}</code></p>
      <p><strong>To wallet:</strong><br><code style="word-break:break-all">${order.cryptoWalletSentTo}</code></p>
      <p style="font-size:13px;color:#666;">After sending, log in to your account and submit your transaction hash to speed up confirmation.</p>
    </div>
    <h3>Order Summary</h3>
    <table class="items">
      ${itemRows}
      <tr><td>Subtotal</td><td style="text-align:right">$${order.subtotal.toFixed(2)}</td></tr>
      ${order.discountAmount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-$${order.discountAmount.toFixed(2)}</td></tr>` : ""}
      <tr><td>Shipping</td><td style="text-align:right">${order.shippingCost === 0 ? "FREE" : `$${order.shippingCost.toFixed(2)}`}</td></tr>
      <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>$${order.total.toFixed(2)}</strong></td></tr>
    </table>
    <a class="btn" href="${SITE_URL}/account/orders/${order.id}">View Order</a>
  `)
  );
}

export async function sendOrderShippedEmail(order: {
  email: string;
  name: string;
  orderId: string;
  trackingNumber: string;
  trackingCarrier: string;
  trackingUrl?: string;
}) {
  await send(
    order.email,
    `Shipment notification — order #${order.orderId.slice(0, 8).toUpperCase()}`,
    layout(`
    <h2>Order shipped</h2>
    <p>Hi ${order.name || "Colleague"}, order #${order.orderId.slice(0, 8).toUpperCase()} has left our facility.</p>
    <p><strong>Carrier:</strong> ${order.trackingCarrier}</p>
    <p><strong>Tracking:</strong> ${order.trackingNumber}</p>
    ${order.trackingUrl ? `<a class="btn" href="${order.trackingUrl}">Track Package</a>` : ""}
    <p style="font-size:13px;color:#999">Materials ship in plain outer packaging without promotional branding.</p>
  `)
  );
}

export async function sendRestockReminderEmail(user: {
  email: string;
  name: string;
  productName: string;
  productSlug: string;
  daysLeft: number;
}) {
  await send(
    user.email,
    `Restock reminder: ${user.productName}`,
    layout(`
    <h2>Inventory reminder</h2>
    <p>Hi ${user.name || "Colleague"}, based on your prior order and the catalog reference interval for <strong>${user.productName}</strong>, you may wish to place a reorder within approximately <strong>${user.daysLeft} days</strong> for uninterrupted laboratory documentation alignment.</p>
    <p>Place orders according to your institutional procurement schedule.</p>
    <a class="btn" href="${SITE_URL}/products/${user.productSlug}">View product</a>
    <p style="font-size:13px;color:#999">Recurring shipment pricing may apply to eligible catalog lines.</p>
  `)
  );
}

export async function sendCartAbandonmentEmail(
  step: number,
  data: {
    email: string;
    name: string;
    cartItems: Array<{ name: string; size: string; quantity: number; price: number }>;
    discountCode?: string;
  }
) {
  const subjects = [
    `Incomplete order — ${SITE_NAME}`,
    `Your cart is still open`,
    `Cart reminder — promotional code`,
  ];
  const messages = [
    `<p>Hi ${data.name || "Colleague"}, your cart still contains the following catalog items:</p>`,
    `<p>Hi ${data.name || "Colleague"}, your checkout was not completed. Batch COAs and specifications remain available on each product page.</p>`,
    `<p>Hi ${data.name || "Colleague"}, you may apply <strong>${data.discountCode}</strong> at checkout for a one-time cart discount where eligible. Code expires in 24 hours.</p>`,
  ];
  const itemList = data.cartItems
    .map((i) => `<li>${i.name} (${i.size}) × ${i.quantity} — $${i.price.toFixed(2)}</li>`)
    .join("");
  await send(
    data.email,
    subjects[step] || subjects[0],
    layout(`
    ${messages[step] || messages[0]}
    <ul>${itemList}</ul>
    <a class="btn" href="${SITE_URL}/cart">Return to Cart</a>
  `)
  );
}

export async function sendWinBackEmail(
  step: number,
  data: {
    email: string;
    name: string;
    discountCode: string;
  }
) {
  const subjects = [
    `${SITE_NAME} — catalog update`,
    `${SITE_NAME} — account offer`,
    `${SITE_NAME} — email preferences`,
  ];
  const messages = [
    `<p>Hi ${data.name || "Colleague"}, use code <strong>${data.discountCode}</strong> on a future catalog order where applicable.</p>`,
    `<p>Hi ${data.name || "Colleague"}, an updated promotional code is available: <strong>${data.discountCode}</strong> (see terms at checkout).</p>`,
    `<p>Hi ${data.name || "Colleague"}, if you wish to continue receiving operational and catalog emails, use the link below. You may also adjust preferences from your account.</p>`,
  ];
  await send(
    data.email,
    subjects[step] || subjects[0],
    layout(`
    ${messages[step] || messages[0]}
    <a class="btn" href="${SITE_URL}/shop">Browse catalog</a>
  `)
  );
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const link = `${SITE_URL}/reset-password?token=${resetToken}`;
  await send(
    email,
    `Reset your password`,
    layout(`
    <h2>Password Reset Request</h2>
    <p>Click the button below to reset your password. This link expires in 1 hour.</p>
    <a class="btn" href="${link}">Reset Password</a>
    <p style="font-size:13px;color:#999">If you didn't request this, ignore this email.</p>
  `)
  );
}

export async function sendReviewRequestEmail(user: {
  email: string;
  name: string;
  productName: string;
  productSlug: string;
  orderId: string;
}) {
  await send(
    user.email,
    `Documentation feedback — ${user.productName}`,
    layout(`
    <h2>Service feedback</h2>
    <p>Hi ${user.name || "Colleague"}, your recent shipment included the materials below. We welcome feedback on packaging integrity, COA clarity, and order handling.</p>
    <p>Verified purchasers may submit a short review for <strong>1,000 loyalty points</strong> per program rules.</p>
    <a class="btn" href="${SITE_URL}/products/${user.productSlug}?review=1&order=${user.orderId}">Submit feedback</a>
  `)
  );
}

export async function sendLowStockAlertEmail(adminEmail: string, lines: string[]) {
  await send(
    adminEmail,
    `[${SITE_NAME}] Low stock alert`,
    layout(`
    <h2>Low stock</h2>
    <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
  `)
  );
}

export async function sendSupportIntakeEmail(payload: {
  type: "contact" | "coa_request";
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
  productSlug?: string;
  productName?: string;
}) {
  const subjectPrefix = payload.type === "coa_request" ? "COA Request" : "Contact Request";
  const subject = `[${SITE_NAME}] ${subjectPrefix} — ${payload.name}`;
  const details = [
    `<p><strong>Type:</strong> ${payload.type}</p>`,
    `<p><strong>Name:</strong> ${payload.name}</p>`,
    `<p><strong>Email:</strong> ${payload.email}</p>`,
    payload.orderNumber ? `<p><strong>Order Number:</strong> ${payload.orderNumber}</p>` : "",
    payload.productName ? `<p><strong>Product:</strong> ${payload.productName}</p>` : "",
    payload.productSlug ? `<p><strong>Product Slug:</strong> ${payload.productSlug}</p>` : "",
    `<hr class="divider">`,
    `<p><strong>Message:</strong></p>`,
    `<p>${payload.message.replace(/\n/g, "<br/>")}</p>`,
  ]
    .filter(Boolean)
    .join("");

  await send(SUPPORT_EMAIL, subject, layout(details));
}

export async function sendNewsletterWelcomeEmail(payload: { to: string }) {
  await send(
    payload.to,
    `Welcome to ${SITE_NAME} updates`,
    layout(`
    <h2>Welcome to the community</h2>
    <p>You are now subscribed to ${SITE_NAME} email updates.</p>
    <p>You can expect occasional updates including:</p>
    <ul>
      <li>New product and catalog additions</li>
      <li>Restock and availability updates</li>
      <li>Site updates and announcements</li>
      <li>Relevant promotional campaign notices</li>
    </ul>
    <a class="btn" href="${SITE_URL}">Visit ${SITE_NAME}</a>
    <p style="margin-top:16px;font-size:12px;color:#999;">
      You can unsubscribe anytime from your account email preferences.
    </p>
  `)
  );
}

export async function sendNewsletterBroadcastEmail(payload: {
  to: string;
  subject: string;
  headline: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const cta =
    payload.ctaLabel && payload.ctaUrl
      ? `<a class="btn" href="${payload.ctaUrl}">${payload.ctaLabel}</a>`
      : `<a class="btn" href="${SITE_URL}/shop">Browse Catalog</a>`;

  await send(
    payload.to,
    payload.subject,
    layout(`
    <h2>${payload.headline}</h2>
    <p>${payload.message.replace(/\n/g, "<br/>")}</p>
    ${cta}
    <p style="margin-top:16px;font-size:12px;color:#999;">
      You are receiving this because you subscribed to updates from ${SITE_NAME}.
      To stop receiving promotional updates, unsubscribe in your account email preferences.
    </p>
  `)
  );
}
