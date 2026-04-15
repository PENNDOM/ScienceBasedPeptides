"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

export function ProductCard(props: {
  id: string;
  slug: string;
  name: string;
  purity?: number | null;
  image: string;
  price: number;
  compareAt?: number | null;
  variantId: string;
  size: string;
  variantSizes?: string[];
  priority?: boolean;
  /** Research hub: same card chrome as shop; links to research PDP and View instead of Add to cart. */
  context?: "shop" | "research";
  /** CSS `background` for image frame (e.g. label-matched gradient when PNG has transparent edges). */
  heroBackgroundCss?: string;
  /** Override object position for portrait studio shots (e.g. center on vial). */
  imageObjectPosition?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const listing = props.context ?? "shop";
  const productHref =
    listing === "research" ? `/research/product/${props.slug}` : `/products/${props.slug}`;
  const heroBg = props.heroBackgroundCss;
  const objectPosition = props.imageObjectPosition;
  const imageClassName = [
    "absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] [background:none]",
    objectPosition ? "" : "object-center",
  ]
    .filter(Boolean)
    .join(" ");
  const onAdd = () => {
    const item: CartItem = {
      productId: props.id,
      variantId: props.variantId,
      name: props.name,
      slug: props.slug,
      size: props.size,
      price: props.price,
      image: props.image,
      quantity: 1,
    };
    addItem(item);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40">
      <Link
        href={productHref}
        className={heroBg ? "relative aspect-[3/4]" : "relative aspect-[3/4] bg-[var(--surface-2)]"}
        style={heroBg ? { background: heroBg } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local /public PNGs; avoids Next/Image black-frame issues on some hosts */}
        <img
          src={props.image || "/placeholder-peptide.svg"}
          alt=""
          className={imageClassName}
          style={objectPosition ? { objectPosition } : undefined}
          loading={props.priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={props.priority ? "high" : undefined}
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={productHref}
          className="font-display min-h-[3.5rem] text-lg font-semibold tracking-tight hover:text-accent"
        >
          {props.name}
        </Link>
        {props.purity != null ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{props.purity}% purity</p>
        ) : null}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg text-[var(--text)]">{formatCurrency(props.price)}</span>
            {props.compareAt && props.compareAt > props.price ? (
              <span className="font-mono text-sm text-[var(--text-muted)] line-through">
                {formatCurrency(props.compareAt)}
              </span>
            ) : null}
          </div>
          {listing === "shop" ? (
            <Button className="mt-4 w-full" type="button" onClick={onAdd}>
              Add to cart
            </Button>
          ) : (
            <Button className="mt-4 w-full" asChild>
              <Link href={productHref}>View</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
