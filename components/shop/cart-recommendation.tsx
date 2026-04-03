"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCanonicalProductImage } from "@/lib/product-pdp-theme";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/lib/cart";
import { cartLineItemImageFrameClass, type CartLineDensity } from "@/components/shop/cart-line-item";

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

/**
 * Bac water when missing; otherwise a bestseller not already in cart (excluding bac slug).
 * Renders as a vertical card: image, copy, full-width add button.
 */
export function CartRecommendation({ density = "comfortable" }: { density?: CartLineDensity }) {
  const { items, addItem } = useCartStore();
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
      body: "Customers often pair this with research peptide orders.",
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
    window.setTimeout(() => setJustAdded(null), 1400);
  }

  if (!activeUpsell) return null;

  const showAdded = justAdded === activeUpsell.variantId;
  const imgSizes = density === "comfortable" ? "(max-width:640px) 112px, 128px" : "96px";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[linear-gradient(120deg,#fffdf9,#f3efe7)] p-3">
      <p className="text-center text-[10px] uppercase tracking-[0.14em] text-accent/85">{activeUpsell.title}</p>

      <div className={`mx-auto mt-2 ${cartLineItemImageFrameClass(density)}`}>
        <Image
          src={activeUpsell.image}
          alt=""
          fill
          className="object-cover object-center"
          sizes={imgSizes}
          unoptimized
        />
      </div>

      <p className="mt-2 text-center font-display text-sm font-semibold leading-snug">{activeUpsell.name}</p>
      <p className="mt-0.5 text-center text-[11px] text-[var(--text-muted)]">{activeUpsell.size}</p>
      <p className="mt-1 text-center font-mono text-xs text-[var(--text)]">{formatCurrency(activeUpsell.price)}</p>

      <p className="mt-2 line-clamp-2 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
        {showAdded ? "Added to your cart." : activeUpsell.body}
      </p>

      <Button className="mt-3 w-full" size="sm" type="button" onClick={addUpsellToCart} disabled={showAdded}>
        {showAdded ? "Added" : "Add to cart"}
      </Button>
    </div>
  );
}
