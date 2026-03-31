"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
}) {
  const addItem = useCartStore((s) => s.addItem);
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
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-accent/40">
      <Link href={`/products/${props.slug}`} className="relative aspect-square bg-surface-2">
        <Image
          src={props.image || "/placeholder-peptide.svg"}
          alt=""
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 25vw"
        />
        {props.purity != null ? (
          <div className="absolute left-2 top-2">
            <Badge variant="purity">{props.purity}% purity</Badge>
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/products/${props.slug}`} className="font-display text-lg font-semibold tracking-tight hover:text-accent">
          {props.name}
        </Link>
        <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">{props.size}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-lg text-[var(--text)]">{formatCurrency(props.price)}</span>
          {props.compareAt && props.compareAt > props.price ? (
            <span className="font-mono text-sm text-[var(--text-muted)] line-through">
              {formatCurrency(props.compareAt)}
            </span>
          ) : null}
        </div>
        <Button className="mt-5 w-full" type="button" onClick={onAdd}>
          Add to cart
        </Button>
      </div>
    </div>
  );
}
