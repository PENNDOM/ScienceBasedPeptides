"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, removeItem, updateQuantity, discountData } = useCartStore();
  const totals = calculateTotals(items, discountData);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <Dialog.Title className="font-display text-lg font-semibold">Your cart</Dialog.Title>
            <Dialog.Close className="rounded-md p-2 hover:bg-surface-2">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.variantId} className="flex gap-3 rounded-[var(--radius)] border border-[var(--border)] p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.name}</p>
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        {i.size} · {formatCurrency(i.price)} each
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                          onClick={() => updateQuantity(i.variantId, i.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="font-mono text-sm">{i.quantity}</span>
                        <button
                          type="button"
                          className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                          onClick={() => updateQuantity(i.variantId, i.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs text-danger underline"
                          onClick={() => removeItem(i.variantId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-[var(--border)] p-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Total</span>
              <span className="font-mono font-semibold">{formatCurrency(totals.total)}</span>
            </div>
            <FooterDisclaimer className="mt-4 text-[11px] leading-snug" />
            <Button className="mt-4 w-full" asChild>
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                Checkout
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
