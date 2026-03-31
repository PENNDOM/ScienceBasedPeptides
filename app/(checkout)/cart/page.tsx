"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { Input } from "@/components/ui/input";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    discountData,
    setDiscount,
  } = useCartStore();
  const [code, setCode] = useState("");
  const [bac, setBac] = useState(false);
  const totals = calculateTotals(items, discountData);

  async function toggleBac(checked: boolean) {
    setBac(checked);
    if (!checked) return;
    const already = useCartStore.getState().items.some((i) => i.slug === "bacteriostatic-water-30ml");
    if (already) return;
    const res = await fetch("/api/products/bacteriostatic-water-30ml");
    const data = await res.json();
    const v = data.variants?.[0];
    const prod = data.product;
    if (!v || !prod) return;
    useCartStore.getState().addItem({
      productId: prod.id,
      variantId: v.id,
      name: prod.name,
      slug: prod.slug,
      size: v.size,
      price: v.price,
      image: "/placeholder-peptide.svg",
      quantity: 1,
    });
  }

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
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <p className="text-[var(--text-muted)]">Your cart is empty.</p>
          ) : (
            items.map((i) => (
              <div
                key={i.variantId}
                className="flex gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-4"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-surface-2">
                  <Image src={i.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${i.slug}`} className="font-medium hover:text-accent">
                    {i.name}
                  </Link>
                  <p className="font-mono text-xs text-[var(--text-muted)]">{i.size}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border border-[var(--border)] px-2"
                      onClick={() => updateQuantity(i.variantId, i.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="font-mono text-sm">{i.quantity}</span>
                    <button
                      type="button"
                      className="rounded border border-[var(--border)] px-2"
                      onClick={() => updateQuantity(i.variantId, i.quantity + 1)}
                    >
                      +
                    </button>
                    <button type="button" className="ml-auto text-xs text-danger underline" onClick={() => removeItem(i.variantId)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right font-mono">{formatCurrency(i.price * i.quantity)}</div>
              </div>
            ))
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={bac} onChange={(e) => void toggleBac(e.target.checked)} />
            Add Bacteriostatic Water 30mL for $11.99?
          </label>
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
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <FooterDisclaimer className="mt-4" />
        </div>
      </div>
    </div>
  );
}
