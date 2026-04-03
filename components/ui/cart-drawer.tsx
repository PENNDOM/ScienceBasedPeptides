"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { CartLineItem } from "@/components/shop/cart-line-item";
import { CartRecommendation } from "@/components/shop/cart-recommendation";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, removeItem, updateQuantity, discountData } = useCartStore();
  const totals = calculateTotals(items, discountData);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedTotal = Math.max(0, totals.subtotal - totals.discountAmount);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(30,26,23,0.22)] backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(30,26,23,0.16)]">
          <div className="border-b border-[var(--border)] bg-[linear-gradient(120deg,#fffdf9,#f3efe7)] px-5 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-display text-2xl font-semibold tracking-tight">Your cart</Dialog.Title>
              <Dialog.Close className="rounded-md p-2 transition hover:bg-accent-muted">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? "item" : "items"} selected` : "No items added yet"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-4 font-display text-2xl font-semibold tracking-tight">Your cart is empty</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Add products to continue to checkout.</p>
                <Button className="mt-5" asChild>
                  <Link href="/shop" onClick={() => onOpenChange(false)}>
                    Browse products
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((i) => (
                  <li
                    key={i.variantId}
                    className="rounded-xl border border-[var(--border)] bg-[linear-gradient(120deg,#fffdf9,#f3efe7)] p-3 sm:p-4"
                  >
                    <CartLineItem
                      item={i}
                      density="compact"
                      onDecrement={() => updateQuantity(i.variantId, i.quantity - 1)}
                      onIncrement={() => updateQuantity(i.variantId, i.quantity + 1)}
                      onRemove={() => removeItem(i.variantId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            {items.length > 0 ? <CartRecommendation density="compact" /> : null}
            <div className={items.length > 0 ? "mt-4 flex justify-between text-sm" : "flex justify-between text-sm"}>
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 ? (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Discount</span>
                <span className="font-mono text-accent">-{formatCurrency(totals.discountAmount)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Estimated total</span>
              <span className="font-mono text-base font-semibold">{formatCurrency(estimatedTotal)}</span>
            </div>
            <FooterDisclaimer className="mt-4 text-[11px] leading-snug" />
            <Button className="mt-4 w-full" asChild disabled={items.length === 0}>
              <Link href="/checkout#checkout-top" onClick={() => onOpenChange(false)}>
                Checkout
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
