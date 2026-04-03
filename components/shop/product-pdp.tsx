"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VariantSelector, type VariantOption } from "@/components/ui/variant-selector";
import { Disclaimer } from "@/components/ui/disclaimer";
import { Badge } from "@/components/ui/badge";
import { getCanonicalProductImage, getPdpHeroGradient } from "@/lib/product-pdp-theme";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";
import { RatingStars } from "@/components/ui/rating-stars";
import { parseProductMeta } from "@/lib/product-meta";
import { ProductCard } from "@/components/ui/product-card";
import { CoaRequestForm } from "@/components/shop/coa-request-form";

const RECENT_KEY = "peptide_recently_viewed";

export function ProductPdp(props: {
  /** Canonical vial URL (matches shop grid). */
  heroImage: string;
  /** CSS linear-gradient for hero card background (label “tab” colors). */
  heroGradient: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    scientificName: string | null;
    categoryName: string;
    categorySlug: string;
    images: string[];
    purity: number | null;
    molecularFormula: string | null;
    casNumber: string | null;
    storageInstructions: string | null;
    cycleLengthDays: number | null;
    subscriptionEligible: boolean;
    subscriptionDiscount: number;
    tags: string[];
  };
  variants: Array<{
    id: string;
    size: string;
    price: number;
    compareAt: number | null;
    stockQty: number;
    lowStockThreshold: number;
  }>;
  labReports: Array<{
    labName: string;
    batchNumber: string;
    purity: number;
    reportUrl: string;
    testedAt: number;
    isCurrent: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string;
    userName: string | null;
  }>;
  related: Array<{
    id: string;
    name: string;
    slug: string;
    images: string[];
    purity: number | null;
    price: number;
    compareAt: number | null;
    variant_id: string;
    size: string;
  }>;
}) {
  const { heroImage, heroGradient, product, variants, labReports, reviews, related } = props;
  const [selectedId, setSelectedId] = useState(variants.find((v) => v.stockQty > 0)?.id ?? variants[0]?.id);
  const [qtyInput, setQtyInput] = useState("1");
  const addItem = useCartStore((s) => s.addItem);

  const selected = useMemo(() => variants.find((v) => v.id === selectedId)!, [variants, selectedId]);
  const variantOpts: VariantOption[] = variants.map((v) => ({
    id: v.id,
    size: v.size,
    price: v.price,
    compareAt: v.compareAt,
    inStock: v.stockQty > 0,
  }));

  const parsedQty = Number(qtyInput);
  const qty = Number.isFinite(parsedQty) && parsedQty >= 0 ? parsedQty : 0;
  const displayPrice = selected.price;
  const meta = useMemo(() => parseProductMeta(product.tags), [product.tags]);
  const displaySpecs = useMemo(
    () =>
      meta.specs.filter((spec) => {
        const raw = spec.value.trim();
        const normalized = raw.toLowerCase();
        return raw.length > 0 && raw !== "[SIZE]" && normalized !== "size";
      }),
    [meta.specs]
  );
  const normalizedScientific = (product.scientificName ?? "").trim().toLowerCase();
  const normalizedName = product.name.trim().toLowerCase();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [product.slug, ...list.filter((s) => s !== product.slug)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [product.slug]);

  function addToCart() {
    const img = heroImage;
    const item: CartItem = {
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      slug: product.slug,
      size: selected.size,
      price: selected.price,
      image: img,
      quantity: qty,
    };
    addItem(item);
  }

  const currentLab = labReports.find((l) => l.isCurrent) ?? labReports[0];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-28 pt-10 md:grid-cols-[minmax(240px,360px)_1fr] md:items-start md:pb-36">
      <div className="space-y-4 md:sticky md:top-24">
        <div
          className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] shadow-sm"
          style={{ background: heroGradient }}
        >
          <Image
            src={heroImage}
            alt={product.name}
            fill
            unoptimized
            quality={100}
            className="object-cover object-center transition duration-300 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 340px"
            priority
          />
          {product.purity != null ? (
            <div className="absolute left-2 top-2 z-[2]">
              <Badge variant="purity">{product.purity}% purity</Badge>
            </div>
          ) : null}
        </div>
        <Disclaimer />
      </div>
      <div>
        <p className="text-sm text-[var(--text-muted)]">
          <Link href={`/shop/${product.categorySlug}`} className="hover:text-accent">
            {product.categoryName}
          </Link>
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{product.shortDescription ?? product.description}</p>
        {product.scientificName && normalizedScientific !== normalizedName ? (
          <p className="mt-2 font-mono text-sm text-[var(--text-muted)]">{product.scientificName}</p>
        ) : null}
        {meta.aliases.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.aliases.map((alias) => (
              <span
                key={alias}
                className="rounded-full border border-[var(--border)] bg-surface-2 px-3 py-1 text-xs text-[var(--text-muted)]"
              >
                {alias}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-6 grid gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Type", value: meta.type },
            { label: "Category", value: meta.family },
            { label: "Batch", value: meta.batch },
            { label: "Batch number", value: currentLab?.batchNumber ?? "—", mono: true },
            { label: "Tested date", value: currentLab ? new Date(currentLab.testedAt * 1000).toLocaleDateString() : "—", mono: true },
          ].map((item) => (
            <div key={item.label} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
              <p className={item.mono ? "mt-1 font-mono text-sm" : "mt-1 text-sm"}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-medium">Size</p>
            <VariantSelector variants={variantOpts} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Quantity</p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              onBlur={() => {
                if (qtyInput.trim() === "") {
                  setQtyInput("0");
                  return;
                }
                const next = Number(qtyInput);
                if (!Number.isFinite(next) || next < 0) setQtyInput("0");
              }}
              className="mt-1 h-10 w-16 rounded-[var(--radius)] border border-accent/40 bg-surface-2 px-2 text-center font-mono text-sm shadow-[0_0_0_1px_rgba(169,212,236,0.22),0_0_22px_rgba(169,212,236,0.22)] outline-none transition focus:border-accent/70 focus:shadow-[0_0_0_1px_rgba(169,212,236,0.4),0_0_26px_rgba(169,212,236,0.3)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-3xl">{formatCurrency(displayPrice * qty)}</span>
          {selected.compareAt && selected.compareAt > selected.price ? (
            <span className="font-mono text-lg text-[var(--text-muted)] line-through">
              {formatCurrency(selected.compareAt * qty)}
            </span>
          ) : null}
        </div>
        {qty >= 3 ? (
          <p className="mt-2 text-sm text-accent">Buy 3+ of the same variant — 10% off at checkout (bulk discount).</p>
        ) : null}
        <Button className="mt-6 w-full lg:sticky lg:bottom-4" size="lg" type="button" onClick={addToCart} disabled={qty <= 0}>
          Add to cart
        </Button>

        <section className="mt-12 space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{product.description}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Compound overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{product.shortDescription ?? product.description}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Storage &amp; handling</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {product.storageInstructions ??
                "Store lyophilized material per label and COA. Solvent selection and working-solution preparation must follow institutional laboratory SOPs for analytical workflows."}
            </p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Specifications</h2>
            <table className="mt-2 w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--border)]">
                {displaySpecs.map((spec) => (
                  <tr key={`${spec.label}:${spec.value}`}>
                    <th className="py-2 text-[var(--text-muted)]">{spec.label}</th>
                    <td className="font-mono">{spec.value}</td>
                  </tr>
                ))}
                {product.molecularFormula ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">Molecular formula</th>
                    <td className="font-mono">{product.molecularFormula}</td>
                  </tr>
                ) : null}
                {product.casNumber ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">CAS</th>
                    <td className="font-mono">{product.casNumber}</td>
                  </tr>
                ) : null}
                {product.purity != null ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">Purity</th>
                    <td className="font-mono">{product.purity}%</td>
                  </tr>
                ) : null}
                {product.cycleLengthDays != null ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">Catalog reference period</th>
                    <td className="font-mono">{product.cycleLengthDays} days</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Related catalog items</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((r) => (
              <ProductCard
                key={r.id}
                id={r.id}
                slug={r.slug}
                name={r.name}
                purity={r.purity}
                imageGradient={getPdpHeroGradient(r.slug)}
                image={getCanonicalProductImage(r.slug, r.images)}
                price={r.price}
                compareAt={r.compareAt}
                variantId={r.variant_id}
                size={r.size}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Reviews</h2>
          <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <RatingStars value={Math.max(1, Math.round(averageRating ?? 5))} />
                <p className="text-sm text-[var(--text-muted)]">
                  {averageRating ? `${averageRating.toFixed(1)} average from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "Be the first verified reviewer"}
                </p>
              </div>
              <p className="rounded-full border border-accent/40 bg-accent-muted px-3 py-1 text-xs text-accent">
                Help other researchers with your experience
              </p>
            </div>
            {reviews.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No reviews yet.</p> : null}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <RatingStars value={r.rating} />
                    <p className="text-xs text-[var(--text-muted)]">{r.userName ?? "Researcher"}</p>
                  </div>
                  {r.title ? <p className="mt-2 font-medium">{r.title}</p> : null}
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
            <h3 className="font-display text-lg font-semibold">Submit a review</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Share your lab experience and help others evaluate this product. Verified purchase is required for approval.
            </p>
            <ReviewForm productId={product.id} />
          </div>
          <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
            <h3 className="font-display text-lg font-semibold">Request Certificate of Analysis (COA)</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Need documentation for this product? Submit your name and email and we will send COA details.
            </p>
            <CoaRequestForm productSlug={product.slug} productName={product.name} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [ratingInput, setRatingInput] = useState("5");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(ratingInput);
    const rating = Number.isFinite(parsed) ? Math.min(5, Math.max(1, parsed)) : 5;
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, body }),
    });
    if (res.ok) setMsg("Review submitted — pending moderation.");
    else setMsg("Could not submit (verified purchase required).");
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-[var(--radius)] border border-[var(--border)] p-4">
      <p className="text-sm font-medium">Submit a review</p>
      <div>
        <label className="text-sm font-medium">Rating (1–5)</label>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={5}
          value={ratingInput}
          onChange={(e) => setRatingInput(e.target.value)}
          onBlur={() => {
            const parsed = Number(ratingInput);
            if (!Number.isFinite(parsed)) {
              setRatingInput("5");
              return;
            }
            setRatingInput(String(Math.min(5, Math.max(1, parsed))));
          }}
          className="mt-1 flex h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3 text-sm outline-none transition focus:border-accent/50 focus:outline-none focus:ring-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          className="mt-1 min-h-[100px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-3 text-sm outline-none transition focus:border-accent/50 focus:outline-none focus:ring-0 focus-visible:ring-0"
        />
      </div>
      <Button type="submit">Submit</Button>
      {msg ? <p className="text-sm text-[var(--text-muted)]">{msg}</p> : null}
    </form>
  );
}

