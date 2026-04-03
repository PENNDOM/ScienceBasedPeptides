"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { getPdpHeroGradient } from "@/lib/product-pdp-theme";

type Item = {
  id: string;
  slug: string;
  name: string;
  purity: number | null;
  image: string;
  price: number;
  compareAt: number | null;
  variantId: string;
  size: string;
};

export function FeaturedProductsCarousel({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? 300;
    const gap = Number.parseInt(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "20", 10) || 20;
    const amount = cardWidth + gap;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll featured products left"
        onClick={() => scrollByAmount("left")}
        className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-surface text-[var(--text)] shadow-md transition hover:border-accent/40 hover:text-accent lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll featured products right"
        onClick={() => scrollByAmount("right")}
        className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-surface text-[var(--text)] shadow-md transition hover:border-accent/40 hover:text-accent lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, idx) => (
          <div key={p.id} className="w-[78vw] max-w-[320px] flex-none md:w-[42vw] lg:w-[30vw] xl:w-[calc((100%-5rem)/5)]">
            <ProductCard
              id={p.id}
              slug={p.slug}
              name={p.name}
              purity={p.purity}
              imageGradient={getPdpHeroGradient(p.slug)}
              image={p.image}
              price={p.price}
              compareAt={p.compareAt}
              variantId={p.variantId}
              size={p.size}
              priority={idx < 5}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[var(--bg)] via-[rgba(247,244,238,0.78)] to-transparent md:hidden" />
      <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[rgba(255,253,249,0.88)] p-1 text-[var(--text-muted)] md:hidden">
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

