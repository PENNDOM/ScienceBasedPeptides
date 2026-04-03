import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as T[]) : fallback;
  } catch {
    return fallback;
  }
}

const PLACEHOLDER_PRODUCT_IMAGE = "/placeholder-peptide.svg";

/** Higher = better primary (matches shop: processed *-clean-2* assets first). */
function productImageRank(url: string): number {
  const lower = url.toLowerCase();
  const ext = /\.(png|webp|jpe?g)$/i;
  const m2 = lower.match(/-clean-2\.(png|webp|jpe?g)$/);
  if (m2) return 1_000_000;
  const mN = lower.match(/-clean-(\d+)\.(png|webp|jpe?g)$/);
  if (mN) {
    const n = parseInt(mN[1], 10);
    return 500_000 + (200 - Math.min(n, 199));
  }
  if (/-clean\.(png|webp|jpe?g)$/i.test(lower)) return 400_000;
  if (/-clean-/i.test(lower) && ext.test(lower)) return 300_000;
  return 0;
}

/**
 * Reorders `products.images` so the first entry is always the same asset the shop grid uses
 * (prefer `*-clean-2.png`, then other `*-clean-*`, then legacy files).
 */
export function orderedProductImages(images: string[] | null | undefined): string[] {
  const list = images?.filter(Boolean) ?? [];
  if (list.length <= 1) return list;
  return list
    .map((url, index) => ({ url, index, rank: productImageRank(url) }))
    .sort((a, b) => b.rank - a.rank || a.index - b.index)
    .map((x) => x.url);
}

/**
 * Primary image URL for cards, PDP, cart — same as shop when multiple files exist.
 */
export function primaryProductImage(images: string[] | null | undefined): string {
  const ordered = orderedProductImages(images);
  return ordered[0] ?? PLACEHOLDER_PRODUCT_IMAGE;
}
