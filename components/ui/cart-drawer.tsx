"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCanonicalProductImage } from "@/lib/product-pdp-theme";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { calculateTotals } from "@/lib/cart";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import type { CartItem } from "@/lib/cart";

const BAC_WATER_SLUG = "bacteriostatic-water-30ml";

type ProductPayload = {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    subscriptionEligible?: boolean;
  };
  variants: Array<{
    id: string;
    size: string;
    price: number;
    isDefault: boolean;
  }>;
};

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  subscriptionEligible?: boolean;
  defaultVariant: {
    id: string;
    size: string;
    price: number;
  };
};

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, removeItem, updateQuantity, addItem, discountData } = useCartStore();
  const totals = calculateTotals(items, discountData);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedTotal = Math.max(0, totals.subtotal - totals.discountAmount);
  const [bacWaterProduct, setBacWaterProduct] = useState<ProductPayload | null>(null);
  const [recommendationCatalog, setRecommendationCatalog] = useState<CatalogProduct[]>([]);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const hasBacWater = items.some((item) => item.slug === BAC_WATER_SLUG);

  useEffect(() => {
    void (async () => {
      const [bacRes, catalogRes] = await Promise.all([
        fetch(`/api/products/${BAC_WATER_SLUG}`),
        fetch("/api/products?sort=best_seller&limit=24"),
      ]);

      if (bacRes.ok) {
        const bac = (await bacRes.json()) as ProductPayload;
        setBacWaterProduct(bac);
      }

      if (catalogRes.ok) {
        const data = (await catalogRes.json()) as { products?: CatalogProduct[] };
        setRecommendationCatalog(data.products ?? []);
      }
    })();
  }, []);

  const activeUpsell = useMemo(() => {
    const cartSlugSet = new Set(items.map((item) => item.slug));
    if (!hasBacWater) {
      if (!bacWaterProduct) return null;
      const variant = bacWaterProduct.variants.find((v) => v.isDefault) ?? bacWaterProduct.variants[0];
      if (!variant) return null;
      return {
        productId: bacWaterProduct.product.id,
        name: bacWaterProduct.product.name,
        slug: bacWaterProduct.product.slug,
        image: getCanonicalProductImage(bacWaterProduct.product.slug, bacWaterProduct.product.images),
        subscriptionEligible: Boolean(bacWaterProduct.product.subscriptionEligible),
        variantId: variant.id,
        size: variant.size,
        price: variant.price,
        title: "Complete your order with Bac Water",
        body: "Add one vial for easier laboratory preparation with your peptides.",
      };
    }

    const nonBacCatalog = recommendationCatalog.filter((p) => p.slug !== BAC_WATER_SLUG);
    const freshRecommendation = nonBacCatalog.find((p) => !cartSlugSet.has(p.slug));
    const fallbackRecommendation = nonBacCatalog[0];
    const recommendation = freshRecommendation ?? fallbackRecommendation;
    if (!recommendation) return null;

    return {
      productId: recommendation.id,
      name: recommendation.name,
      slug: recommendation.slug,
      image: getCanonicalProductImage(recommendation.slug, recommendation.images),
      subscriptionEligible: Boolean(recommendation.subscriptionEligible),
      variantId: recommendation.defaultVariant.id,
      size: recommendation.defaultVariant.size,
      price: recommendation.defaultVariant.price,
      title: "Popular add-on recommendation",
      body: "Customers often pair this product with Bac Water orders.",
    };
  }, [hasBacWater, bacWaterProduct, recommendationCatalog, items]);

  function addUpsellToCart() {
    if (!activeUpsell) return;
    const item: CartItem = {
      productId: activeUpsell.productId,
      variantId: activeUpsell.variantId,
      name: activeUpsell.name,
      slug: activeUpsell.slug,
      size: activeUpsell.size,
      price: activeUpsell.price,
      image: activeUpsell.image,
      quantity: 1,
      subscriptionEligible: activeUpsell.subscriptionEligible,
    };
    addItem(item);
    setJustAdded(activeUpsell.variantId);
    window.setTimeout(() => setJustAdded(null), 1100);
  }

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
          <div className="flex-1 overflow-y-auto px-4 py-4">
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
                    className="rounded-xl border border-[var(--border)] bg-[linear-gradient(120deg,#fffdf9,#f3efe7)] p-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                        <Image
                          src={i.image || "/placeholder-peptide.svg"}
                          alt={i.name}
                          fill
                          className="object-cover object-center"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{i.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{i.size}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="font-mono text-xs text-[var(--text-muted)]">{formatCurrency(i.price)} each</p>
                          <p className="font-mono text-sm font-semibold">{formatCurrency(i.price * i.quantity)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] transition hover:border-accent/40 hover:text-accent"
                        onClick={() => updateQuantity(i.variantId, i.quantity - 1)}
                        aria-label={`Decrease ${i.name} quantity`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center font-mono text-sm">{i.quantity}</span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] transition hover:border-accent/40 hover:text-accent"
                        onClick={() => updateQuantity(i.variantId, i.quantity + 1)}
                        aria-label={`Increase ${i.name} quantity`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-danger transition hover:opacity-80"
                        onClick={() => removeItem(i.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            {items.length > 0 && activeUpsell ? (
              <div className="mb-4 rounded-xl border border-[var(--border)] bg-[linear-gradient(120deg,#fffdf9,#f3efe7)] p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-accent/85">{activeUpsell.title}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                    <Image src={activeUpsell.image} alt={activeUpsell.name} fill className="object-cover object-center" sizes="48px" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{activeUpsell.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{activeUpsell.size}</p>
                    <p className="font-mono text-xs text-[var(--text-muted)]">{formatCurrency(activeUpsell.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={addUpsellToCart}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/45 bg-accent-muted text-accent transition hover:border-accent hover:bg-accent/20"
                    aria-label={`Add ${activeUpsell.name} to cart`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {justAdded === activeUpsell.variantId ? "Added to cart." : activeUpsell.body}
                </p>
              </div>
            ) : null}
            <div className="flex justify-between text-sm">
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
