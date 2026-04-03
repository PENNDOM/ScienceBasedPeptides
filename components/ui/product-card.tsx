"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

export function ProductCard(props: {
  id: string;
  slug: string;
  name: string;
  purity?: number | null;
  /** Same tone as PDP hero: vertical gradient behind the vial (lighter → darker). */
  imageGradient?: string;
  image: string;
  price: number;
  compareAt?: number | null;
  variantId: string;
  size: string;
  variantSizes?: string[];
  priority?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const imageClassName = "object-cover object-center transition duration-300 group-hover:scale-[1.02]";
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
        href={`/products/${props.slug}`}
        className={cn("relative aspect-[3/4]", !props.imageGradient && "bg-[var(--surface-2)]")}
        style={props.imageGradient ? { background: props.imageGradient } : undefined}
      >
        <Image
          src={props.image || "/placeholder-peptide.svg"}
          alt=""
          fill
          className={imageClassName}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
          quality={100}
          unoptimized
          priority={props.priority}
        />
        {props.purity != null ? (
          <div className="absolute left-2 top-2">
            <Badge variant="purity">{props.purity}% purity</Badge>
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/products/${props.slug}`}
          className="font-display min-h-[3.5rem] text-lg font-semibold tracking-tight hover:text-accent"
        >
          {props.name}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg text-[var(--text)]">{formatCurrency(props.price)}</span>
            {props.compareAt && props.compareAt > props.price ? (
              <span className="font-mono text-sm text-[var(--text-muted)] line-through">
                {formatCurrency(props.compareAt)}
              </span>
            ) : null}
          </div>
          <Button className="mt-4 w-full" type="button" onClick={onAdd}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
