"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

type VariantOption = {
  id: string;
  size: string;
  price: number;
  compareAt: number | null;
  isDefault: boolean;
};

type Item = {
  id: string;
  slug: string;
  name: string;
  purity: number | null;
  /** Transparent vial-only asset for this section */
  image: string;
  /** Tone-matched shop image for cart consistency */
  shopImage: string;
  price: number;
  compareAt: number | null;
  variantId: string;
  size: string;
  variants: VariantOption[];
};

const spring = {
  type: "spring",
  stiffness: 110,
  damping: 20,
} as const;

/** Default variant for price + add-to-cart (no size picker on featured block). */
function defaultVariant(item: Item | null) {
  if (!item?.variants?.length) return null;
  return item.variants.find((v) => v.isDefault) ?? item.variants[0] ?? null;
}

type SideDecorSlot = {
  top: string;
  lateral: string;
  w: number;
  h: number;
  rot: number;
};

/** Tilted vials for left / right strips (percent positions within each strip). */
const LEFT_DECOR_SLOTS: SideDecorSlot[] = [
  { top: "4%", lateral: "6%", w: 76, h: 108, rot: -18 },
  { top: "22%", lateral: "-2%", w: 68, h: 96, rot: 14 },
  { top: "38%", lateral: "18%", w: 72, h: 102, rot: -11 },
  { top: "56%", lateral: "4%", w: 64, h: 90, rot: 19 },
  { top: "72%", lateral: "22%", w: 70, h: 98, rot: -15 },
  { top: "88%", lateral: "8%", w: 60, h: 84, rot: 10 },
  { top: "12%", lateral: "28%", w: 56, h: 78, rot: 22 },
  { top: "48%", lateral: "-8%", w: 58, h: 82, rot: -20 },
];

const RIGHT_DECOR_SLOTS: SideDecorSlot[] = [
  { top: "6%", lateral: "8%", w: 74, h: 104, rot: 16 },
  { top: "24%", lateral: "-4%", w: 70, h: 100, rot: -13 },
  { top: "40%", lateral: "16%", w: 66, h: 94, rot: 18 },
  { top: "58%", lateral: "6%", w: 72, h: 102, rot: -12 },
  { top: "74%", lateral: "20%", w: 62, h: 88, rot: 11 },
  { top: "90%", lateral: "10%", w: 68, h: 96, rot: -17 },
  { top: "14%", lateral: "26%", w: 54, h: 76, rot: -21 },
  { top: "50%", lateral: "-6%", w: 60, h: 86, rot: 15 },
];

/** Compact label under non-selected thumbs; blends use short tokens (e.g. CJC + IPA). */
function featuredThumbShortLabel(name: string): string {
  const n = name.trim();
  const isBlend = /\s*\+\s*/.test(n);
  if (isBlend) {
    const parts = n.split(/\s*\+\s*/).map((p) => p.trim()).filter(Boolean);
    /** 3+ parts: tighter join (BPC+GHK+TB) so one line + aligned thumbs */
    const tight = parts.length >= 3;
    return parts.map((p) => abbrevPart(p.trim(), true, tight)).join(tight ? "+" : " + ");
  }
  if (n.length <= 14) return n;
  return abbrevPart(n, false);
}

function abbrevPart(segment: string, compactBlend: boolean, tightMultiBlend = false): string {
  const s = segment.trim();
  const low = s.toLowerCase();

  if (/^bpc[- ]?157$/i.test(s)) return compactBlend ? "BPC" : "BPC-157";
  if (/^tb[- ]?500$/i.test(s)) return compactBlend ? "TB" : "TB-500";
  if (/^ghk[- ]?cu$/i.test(s)) return tightMultiBlend ? "GHK" : "GHK-Cu";
  if (/^cjc[- ]?1295(?:\s+no\s+dac)?$/i.test(s)) return "CJC";
  if (/^ipamorelin$/i.test(s)) return "IPA";
  if (/^semaglutide$/i.test(s)) return "SEMA";
  if (/^retatrutide$/i.test(s)) return "RETA";
  if (/^tesamorelin$/i.test(s)) return "TES";
  if (/^melanotan\s*i$/i.test(s)) return "MT-I";
  if (/^melanotan\s*ii$/i.test(s)) return "MT-II";
  if (/^nad\+?$/i.test(s)) return "NAD+";
  if (/^bac(?:\s*water)?$/i.test(s) || /^bacteriostatic/i.test(low)) return "BAC water";

  if (s.length <= 14) return s;

  const words = s.split(/[\s/-]+/).filter(Boolean);
  if (words.length >= 2) {
    const acronym = words
      .map((w) => (/^\d/.test(w) ? w : w[0]))
      .join("")
      .toUpperCase()
      .slice(0, 6);
    return acronym || s.slice(0, 12);
  }
  return s.length > 14 ? `${s.slice(0, 12)}…` : s;
}

export function FeaturedProductsShowcase({ items }: { items: Item[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const addItem = useCartStore((s) => s.addItem);

  const selected = useMemo(() => {
    return items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedId]);

  const activeVariant = useMemo(() => defaultVariant(selected), [selected]);

  const decorImageUrls = useMemo(() => {
    const urls = items.map((i) => i.image);
    if (urls.length === 0) return [];
    return Array.from({ length: 24 }, (_, i) => urls[i % urls.length]!);
  }, [items]);

  if (!selected || !activeVariant) return null;

  function onAddToCart() {
    if (!selected || !activeVariant) return;
    const item: CartItem = {
      productId: selected.id,
      variantId: activeVariant.id,
      name: selected.name,
      slug: selected.slug,
      size: activeVariant.size,
      price: activeVariant.price,
      image: selected.shopImage,
      quantity: 1,
    };
    addItem(item);
  }

  return (
    <LayoutGroup id="homepage-featured-showcase">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(150deg,rgba(255,253,249,0.98),rgba(243,239,231,0.96))] p-5 md:p-7">
        {/* Tilted vial fills — only this featured card; desktop+ side gutters */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[min(20%,7.25rem)] select-none md:block lg:w-[min(22%,9.5rem)]"
          aria-hidden
        >
          <div className="relative h-full w-full [mask-image:linear-gradient(to_right,black_50%,transparent)]">
            {LEFT_DECOR_SLOTS.map((slot, i) => (
              <div
                key={`decor-l-${i}`}
                className="absolute bg-contain bg-center bg-no-repeat opacity-[0.22]"
                style={{
                  backgroundImage: decorImageUrls[i] ? `url(${decorImageUrls[i]})` : undefined,
                  top: slot.top,
                  left: slot.lateral,
                  width: slot.w,
                  height: slot.h,
                  transform: `rotate(${slot.rot}deg)`,
                }}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[min(20%,7.25rem)] select-none md:block lg:w-[min(22%,9.5rem)]"
          aria-hidden
        >
          <div className="relative h-full w-full [mask-image:linear-gradient(to_left,black_50%,transparent)]">
            {RIGHT_DECOR_SLOTS.map((slot, i) => (
              <div
                key={`decor-r-${i}`}
                className="absolute bg-contain bg-center bg-no-repeat opacity-[0.22]"
                style={{
                  backgroundImage: decorImageUrls[i + LEFT_DECOR_SLOTS.length]
                    ? `url(${decorImageUrls[i + LEFT_DECOR_SLOTS.length]})`
                    : undefined,
                  top: slot.top,
                  right: slot.lateral,
                  width: slot.w,
                  height: slot.h,
                  transform: `rotate(${slot.rot}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-center md:gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="flex w-full max-w-[22rem] shrink-0 flex-col justify-center text-left md:max-w-[20rem]"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Featured selection</p>
              <h3 className="mt-1.5 font-display text-3xl font-semibold tracking-tight md:text-4xl">{selected.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Research Compound</p>
              <div className="mt-2.5 flex items-end gap-2">
                <p className="font-mono text-2xl font-semibold">{formatCurrency(activeVariant.price)}</p>
                {activeVariant.compareAt && activeVariant.compareAt > activeVariant.price ? (
                  <p className="font-mono text-sm text-[var(--text-muted)] line-through">
                    {formatCurrency(activeVariant.compareAt)}
                  </p>
                ) : null}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-3">
                <Button type="button" onClick={onAddToCart}>
                  Add to cart
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={`/products/${selected.slug}`}>View product</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative flex h-[300px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] sm:h-[330px] sm:w-[260px] md:h-[360px] md:w-[280px]">
            <motion.div
              key={`hero-${selected.id}`}
              layoutId={`featured-vial-${selected.id}`}
              transition={spring}
              className="relative flex h-full w-full items-center justify-center"
            >
              <div
                className="h-full w-full origin-center scale-[1.58] bg-contain bg-center bg-no-repeat sm:scale-[1.68] md:scale-[1.78]"
                style={{ backgroundImage: `url(${selected.image})` }}
                aria-label={selected.name}
              />
            </motion.div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex min-w-max items-start justify-center gap-3 md:gap-4">
            {items.map((item) => {
              const active = item.id === selected.id;
              const shortLabel = featuredThumbShortLabel(item.name);
              return (
                <div key={item.id} className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`group relative flex h-[104px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition md:h-[128px] md:w-[100px] ${
                      active
                        ? "border-accent/50 bg-accent-muted/40"
                        : "border-[var(--border)] bg-[var(--surface-2)] opacity-80 hover:scale-[1.03] hover:opacity-100"
                    }`}
                    aria-label={`Select ${item.name}`}
                  >
                    {active ? (
                      <div
                        className="h-full w-full origin-center scale-[1.34] bg-contain bg-center bg-no-repeat opacity-95 sm:scale-[1.38]"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    ) : (
                      <motion.div
                        layoutId={`featured-vial-${item.id}`}
                        transition={spring}
                        className="flex h-full w-full items-center justify-center"
                      >
                        <div
                          className="h-full w-full origin-center scale-[1.34] bg-contain bg-center bg-no-repeat sm:scale-[1.38]"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      </motion.div>
                    )}
                  </button>
                  {/* Fixed label slot so 1- vs 2-line names never shift the image holders */}
                  <div className="flex min-h-[2.125rem] w-full max-w-[6.5rem] flex-col items-center justify-start md:min-h-[2.375rem]">
                    <span
                      className={`block max-w-[5.5rem] text-center text-[10px] font-medium leading-snug tracking-wide md:max-w-[6.25rem] md:text-[11px] ${
                        active ? "invisible pointer-events-none select-none" : "text-[var(--text-muted)]"
                      }`}
                      aria-hidden={active}
                    >
                      {shortLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
