"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import type { CryptoOption } from "@/lib/crypto-payment";
import { CryptoQR } from "@/components/ui/crypto-qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { useAuthStore } from "@/store/auth-store";

export function CheckoutClient({
  options,
  qrMap,
}: {
  options: CryptoOption[];
  qrMap: Record<string, string>;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { items, discountData, clearCart } = useCartStore();
  const totals = calculateTotals(items, discountData);
  const [symbol, setSymbol] = useState(options[0]?.symbol ?? "BTC");
  const [guestEmail, setGuestEmail] = useState("");
  const [addr, setAddr] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [tx, setTx] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);
  const [newsletterSending, setNewsletterSending] = useState(false);

  const selected = options.find((o) => o.symbol === symbol) ?? options[0];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  async function placeOrder() {
    setLoading(true);
    setErr(null);
    const email = user?.email ?? guestEmail;
    if (!email) {
      setErr("Email required");
      setLoading(false);
      return;
    }
    if (!addr.fullName.trim() || !addr.line1.trim() || !addr.city.trim() || !addr.state.trim() || !addr.zip.trim() || !addr.country.trim()) {
      setErr("Shipping details are required to complete order.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        discount: discountData,
        loyaltyPointsToRedeem: 0,
        isSubscription: false,
        guestEmail: user ? undefined : email,
        shippingAddress: addr,
        cryptoSymbol: symbol,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setErr(e.error ?? "Order failed");
      return;
    }
    const data = await res.json();
    const oid = data.order.id as string;
    if (tx) {
      await fetch(`/api/orders/${oid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoTxHash: tx }),
      });
    }
    clearCart();
    router.push(`/order-confirmation/${oid}`);
  }

  async function submitNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterMsg(null);
    setNewsletterSending(true);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newsletterEmail, consent: true }),
    });
    setNewsletterSending(false);
    if (res.ok) {
      setNewsletterMsg("You have been signed up for updates.");
      setNewsletterEmail("");
    } else {
      setNewsletterMsg("Please enter a valid email address.");
    }
  }

  return (
    <div id="checkout-top" className="relative overflow-hidden bg-[#0F0F0F]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(0,227,201,0.14),transparent_36%),radial-gradient(circle_at_82%_14%,rgba(0,182,255,0.08),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(120deg,#132120,#101818)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8f8f]">Secure checkout</p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Complete your order</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                Finalize shipping and payment details below. Your order is secured and processed through our encrypted checkout flow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-xl border border-white/10 bg-[#11201e] px-4 py-3 text-center">
                <p className="text-xs text-[var(--text-muted)]">Items</p>
                <p className="font-mono text-xl font-semibold">{itemCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#11201e] px-4 py-3 text-center">
                <p className="text-xs text-[var(--text-muted)]">Order total</p>
                <p className="font-mono text-xl font-semibold">{formatCurrency(totals.total)}</p>
              </div>
            </div>
          </div>
          {!user ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              <Link href="/login" className="text-accent transition hover:text-[var(--accent-hover)]">
                Log in
              </Link>{" "}
              for faster checkout, or continue as guest.
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-[#141814] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] md:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <h2 className="font-display text-2xl font-semibold tracking-tight">Shipping details</h2>
              </div>
              <div className="mt-6 space-y-4">
                {!user ? <Input label="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" required /> : null}
                <Input label="Full name" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required />
                <Input label="Address line 1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
                <Input
                  label="Address line 2 (optional)"
                  value={addr.line2}
                  onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                  required={false}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
                  <Input label="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} required />
                  <Input label="ZIP" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} required />
                  <Input label="Country" value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141814] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] md:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="font-display text-2xl font-semibold tracking-tight">Cryptocurrency payment</h2>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Select an asset and send the exact amount shown. Rates refresh from public market data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {options.map((o) => (
                  <button
                    key={o.symbol}
                    type="button"
                    onClick={() => setSymbol(o.symbol)}
                    className={`rounded-full border px-4 py-2 text-sm font-mono transition ${
                      symbol === o.symbol
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-white/15 bg-[#101917] text-[var(--text-muted)] hover:border-accent/40 hover:text-[var(--text)]"
                    }`}
                  >
                    {o.symbol}
                  </button>
                ))}
              </div>
              <Input className="mt-10" label="Transaction hash (optional)" value={tx} onChange={(e) => setTx(e.target.value)} />
              {err ? <p className="mt-3 text-sm text-danger">{err}</p> : null}
              <Button className="mt-6" size="lg" type="button" disabled={loading || items.length === 0} onClick={placeOrder}>
                {loading ? "Placing..." : "Place order"}
              </Button>
            </div>

            <section className="rounded-2xl border border-white/10 bg-[linear-gradient(110deg,#1b2a2a,#222932,#2d2731)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
                    Stay Updated with Science Based Peptides
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Get product release alerts, lab-focused insights, and catalog update notifications.
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">Be a part of 100+ subscribers, unsubscribe anytime.</p>
                </div>
                <form onSubmit={submitNewsletter} className="w-full max-w-md">
                  <div className="flex w-full items-center rounded-full border border-white/20 bg-black p-1 shadow-inner">
                    <input
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="h-10 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-[#8e8e8e] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={newsletterSending}
                      className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-[#0a0f0d] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
                    >
                      {newsletterSending ? "..." : "Subscribe"}
                    </button>
                  </div>
                  {newsletterMsg ? <p className="mt-2 text-xs text-[var(--text-muted)]">{newsletterMsg}</p> : null}
                </form>
              </div>
            </section>
          </section>

          <aside className="flex h-full flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#141814] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Order summary</h2>
              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-[#101917] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Your cart is empty.</p>
                    <Button className="mt-4 w-full" variant="secondary" asChild>
                      <Link href="/shop">
                        Browse shop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  items.map((i) => (
                    <div key={i.variantId} className="rounded-xl border border-white/10 bg-[#101917] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{i.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {i.size} x {i.quantity}
                          </p>
                        </div>
                        <p className="font-mono text-sm">{formatCurrency(i.price * i.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Subtotal</span>
                  <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Discount</span>
                    <span className="font-mono text-accent">-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Shipping</span>
                  <span className="font-mono">{totals.shippingCost === 0 ? "FREE" : formatCurrency(totals.shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono text-lg font-semibold">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-[#101917] p-3 text-xs text-[var(--text-muted)]">
                <p className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  You will confirm crypto transfer details after placing your order.
                </p>
              </div>

              <Button className="mt-5 w-full" size="lg" type="button" disabled={loading || items.length === 0} onClick={placeOrder}>
                {loading ? "Placing..." : "Place order"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {selected ? (
              <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-[#141814] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
                <h3 className="font-display text-xl font-semibold tracking-tight">Payment details</h3>
                <div className="mt-4 rounded-xl border border-white/10 bg-[#101917] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">USD total</p>
                  <p className="mt-1 font-mono text-3xl font-semibold">{formatCurrency(totals.total)}</p>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Send exactly this amount in {selected.symbol} (shown on confirmation after placing order).
                  </p>
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-[#101917] p-4">
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--text-muted)]">
                    <li>Place your order to lock totals.</li>
                    <li>Copy the wallet address and exact crypto amount from the confirmation page.</li>
                    <li>Send from your wallet and avoid rounding.</li>
                    <li>Paste your transaction hash on the left (optional before or after placing).</li>
                  </ol>
                </div>
                <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-[#101917] p-4">
                  <CryptoQR className="mx-auto w-full max-w-[300px] text-center" address={selected.walletAddress} qrDataUrl={qrMap[selected.symbol] ?? ""} />
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-[var(--text-muted)]">For laboratory research use only. Not intended for human use.</p>
        </div>
      </div>
    </div>
  );
}
