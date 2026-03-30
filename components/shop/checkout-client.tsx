"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CryptoOption } from "@/lib/crypto-payment";
import { CryptoQR } from "@/components/ui/crypto-qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { useAuthStore } from "@/store/auth-store";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

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

  const selected = options.find((o) => o.symbol === symbol) ?? options[0];

  async function placeOrder() {
    setLoading(true);
    setErr(null);
    const email = user?.email ?? guestEmail;
    if (!email) {
      setErr("Email required");
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>
      {!user ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          <Link href="/login" className="text-accent underline">
            Log in
          </Link>{" "}
          or continue as guest (email required).
        </p>
      ) : null}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {!user ? <Input label="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" required /> : null}
          <Input label="Full name" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required />
          <Input label="Address line 1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
          <Input label="Address line 2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
            <Input label="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} required />
            <Input label="ZIP" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} required />
            <Input label="Country" value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} />
          </div>
        </div>
        <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2">
                <span>
                  {i.name} ({i.size}) × {i.quantity}
                </span>
                <span className="font-mono">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Total (USD)</span>
            <span className="font-mono">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Cryptocurrency payment</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Select an asset and send the exact amount shown. Rates refresh from public market data.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.symbol}
              type="button"
              onClick={() => setSymbol(o.symbol)}
              className={`rounded-md border px-3 py-2 text-sm font-mono ${symbol === o.symbol ? "border-accent bg-accent-muted text-accent" : "border-[var(--border)]"}`}
            >
              {o.symbol}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--text-muted)]">USD total</p>
              <p className="font-mono text-2xl">{formatCurrency(totals.total)}</p>
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Send exactly this amount in {selected.symbol} (shown on confirmation after placing order).
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--text-muted)]">
                <li>Place your order to lock totals.</li>
                <li>Copy the wallet address and exact crypto amount from the confirmation page.</li>
                <li>Send from your wallet — do not round.</li>
                <li>Paste your transaction hash below (optional before or after placing).</li>
              </ol>
            </div>
            <CryptoQR address={selected.walletAddress} qrDataUrl={qrMap[selected.symbol] ?? ""} />
          </div>
        ) : null}
        <Input className="mt-6" label="Transaction hash (optional)" value={tx} onChange={(e) => setTx(e.target.value)} />
        {err ? <p className="mt-2 text-sm text-danger">{err}</p> : null}
        <Button className="mt-6" size="lg" type="button" disabled={loading || items.length === 0} onClick={placeOrder}>
          {loading ? "Placing…" : "Place order"}
        </Button>
      </div>
      <div className="mt-10">
        <FooterDisclaimer />
      </div>
    </div>
  );
}
