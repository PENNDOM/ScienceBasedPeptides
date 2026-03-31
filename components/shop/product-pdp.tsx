"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VariantSelector, type VariantOption } from "@/components/ui/variant-selector";
import { Disclaimer } from "@/components/ui/disclaimer";
import { LabReportBadge } from "@/components/ui/lab-report-badge";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";
import { RatingStars } from "@/components/ui/rating-stars";

const RECENT_KEY = "peptide_recently_viewed";

export function ProductPdp(props: {
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
    price: number;
    variant_id: string;
    size: string;
  }>;
}) {
  const { product, variants, labReports, reviews, related } = props;
  const [selectedId, setSelectedId] = useState(variants.find((v) => v.stockQty > 0)?.id ?? variants[0]?.id);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const selected = useMemo(() => variants.find((v) => v.id === selectedId)!, [variants, selectedId]);
  const variantOpts: VariantOption[] = variants.map((v) => ({
    id: v.id,
    size: v.size,
    price: v.price,
    compareAt: v.compareAt,
    inStock: v.stockQty > 0,
  }));

  const displayPrice = selected.price;

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
    const img = product.images[0] ?? "/placeholder-peptide.svg";
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

  return (
    <div className="container-shell section-shell grid gap-12 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 shadow-card">
          <Image
            src={product.images[0] ?? "/placeholder-peptide.svg"}
            alt=""
            fill
            className="object-cover transition duration-300 hover:scale-[1.02]"
            priority
          />
        </div>
        <Disclaimer />
      </div>
      <div>
        <p className="text-sm text-[var(--text-muted)]">
          <Link href={`/shop/${product.categorySlug}`} className="hover:text-accent">
            {product.categoryName}
          </Link>
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
        {product.scientificName ? (
          <p className="mt-2 font-mono text-sm text-[var(--text-muted)]">{product.scientificName}</p>
        ) : null}
        {currentLab ? (
          <div className="mt-6">
            <LabReportBadge
              purity={currentLab.purity}
              labName={currentLab.labName}
              batchNumber={currentLab.batchNumber}
              testedAt={currentLab.testedAt}
              reportUrl={currentLab.reportUrl}
            />
          </div>
        ) : null}

        <div className="mt-8">
          <p className="text-sm font-medium">Variant</p>
          <VariantSelector variants={variantOpts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Quantity</p>
            <input
              type="number"
              min={1}
              max={selected.stockQty}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="mt-1 h-10 w-20 rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-2 font-mono text-sm"
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
        <Button className="mt-6 w-full lg:sticky lg:bottom-4" size="lg" type="button" onClick={addToCart}>
          Add to cart
        </Button>

        <Tabs defaultValue="overview" className="mt-12 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-6">
          <TabsList className="flex flex-wrap gap-2 bg-transparent">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="research">Compound overview</TabsTrigger>
            <TabsTrigger value="storage">Storage &amp; handling</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            {product.description}
          </TabsContent>
          <TabsContent value="research" className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            {product.shortDescription ?? product.description}
          </TabsContent>
          <TabsContent value="storage" className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            {product.storageInstructions ??
              "Store lyophilized material per label and COA. Solvent selection and working-solution preparation must follow institutional laboratory SOPs for analytical workflows."}
          </TabsContent>
          <TabsContent value="specs" className="mt-4">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--border)]">
                <tr>
                  <th className="py-2 text-[var(--text-muted)]">Molecular formula</th>
                  <td className="font-mono">{product.molecularFormula ?? "—"}</td>
                </tr>
                <tr>
                  <th className="py-2 text-[var(--text-muted)]">CAS</th>
                  <td className="font-mono">{product.casNumber ?? "—"}</td>
                </tr>
                <tr>
                  <th className="py-2 text-[var(--text-muted)]">Purity</th>
                  <td className="font-mono">{product.purity ?? "—"}%</td>
                </tr>
                <tr>
                  <th className="py-2 text-[var(--text-muted)]">Catalog reference period</th>
                  <td className="font-mono">{product.cycleLengthDays ?? "—"} days</td>
                </tr>
              </tbody>
            </table>
          </TabsContent>
        </Tabs>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Related catalog items</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.slug}`}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent/40"
              >
                <p className="font-medium">{r.name}</p>
                <p className="mt-2 font-mono text-sm">{formatCurrency(r.price)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
                <RatingStars value={r.rating} />
                {r.title ? <p className="mt-2 font-medium">{r.title}</p> : null}
                <p className="mt-2 text-sm text-[var(--text-muted)]">{r.body}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{r.userName ?? "Researcher"}</p>
              </div>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </section>
      </div>
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 flex h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          className="mt-1 min-h-[100px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-3 text-sm"
        />
      </div>
      <Button type="submit">Submit</Button>
      {msg ? <p className="text-sm text-[var(--text-muted)]">{msg}</p> : null}
    </form>
  );
}
