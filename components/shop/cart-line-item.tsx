"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";

export type CartLineDensity = "comfortable" | "compact";

/** Same frame as cart line product thumbnails — use for upsell images so sizes stay aligned. */
export function cartLineItemImageFrameClass(density: CartLineDensity): string {
  return density === "comfortable"
    ? "relative aspect-[3/4] h-[9.5rem] w-[7rem] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] sm:h-[10.5rem] sm:w-[7.75rem]"
    : "relative aspect-[3/4] h-[8rem] w-[5.85rem] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]";
}

export function CartLineItem({
  item,
  onDecrement,
  onIncrement,
  onRemove,
  density = "comfortable",
}: {
  item: CartItem;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
  /** `compact` fits the cart drawer width; `comfortable` uses a larger image on the full cart page. */
  density?: CartLineDensity;
}) {
  const imgWrap = cartLineItemImageFrameClass(density);

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className={`${imgWrap} shrink-0`}>
        <Image
          src={item.image || "/placeholder-peptide.svg"}
          alt=""
          fill
          className="object-cover object-center"
          sizes={density === "comfortable" ? "(max-width:640px) 112px, 128px" : "96px"}
          unoptimized
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <Link href={`/products/${item.slug}`} className="line-clamp-2 font-medium leading-snug hover:text-accent">
            {item.name}
          </Link>
          <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">{item.size}</p>
          <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{formatCurrency(item.price)} each</p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
          <p className="font-mono text-sm font-semibold tabular-nums sm:text-base">
            {formatCurrency(item.price * item.quantity)}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] transition hover:border-accent/40 hover:text-accent"
              onClick={onDecrement}
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2ch] text-center font-mono text-sm tabular-nums">{item.quantity}</span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] transition hover:border-accent/40 hover:text-accent"
              onClick={onIncrement}
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            className="text-xs text-danger underline transition hover:opacity-80"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
