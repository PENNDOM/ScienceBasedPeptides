"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { Input } from "@/components/ui/input";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { CartLineItem } from "@/components/shop/cart-line-item";
import { CartRecommendation } from "@/components/shop/cart-recommendation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, discountData, setDiscount } = useCartStore();
  const [code, setCode] = useState("");
  const totals = calculateTotals(items, discountData);

  async function applyCode() {
    const res = await fetch("/api/discounts/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal: totals.subtotal }),
    });
    if (!res.ok) {
      setDiscount(null);
      return;
    }
    const data = await res.json();
    setDiscount(data.discount);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {items.length === 0 ? (
            <p className="text-[var(--text-muted)]">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((i) => (
                  <div
                    key={i.variantId}
                    className="rounded-[var(--radius)] border border-[var(--border)] bg-surface p-4 sm:p-5"
                  >
                    <CartLineItem
                      item={i}
                      density="comfortable"
                      onDecrement={() => updateQuantity(i.variantId, i.quantity - 1)}
                      onIncrement={() => updateQuantity(i.variantId, i.quantity + 1)}
                      onRemove={() => removeItem(i.variantId)}
                    />
                  </div>
                ))}
              </div>
              <CartRecommendation />
            </>
          )}
        </div>
        <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-6">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Free shipping</p>
            <ProgressBar value={totals.subtotal - totals.discountAmount} max={totals.freeShippingThreshold} />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {totals.amountToFreeShipping > 0
                ? `Add ${formatCurrency(totals.amountToFreeShipping)} more for free shipping`
                : "Unlocked"}
            </p>
          </div>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" />
            <Button type="button" variant="secondary" onClick={applyCode}>
              Apply
            </Button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Discounts</span>
              <span className="font-mono">-{formatCurrency(totals.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Shipping</span>
              <span className="font-mono">{totals.shippingCost === 0 ? "FREE" : formatCurrency(totals.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <Button className="w-full" asChild>
            <Link href="/checkout#checkout-top">Proceed to checkout</Link>
          </Button>
          <FooterDisclaimer className="mt-4" />
        </div>
      </div>
    </div>
  );
}
