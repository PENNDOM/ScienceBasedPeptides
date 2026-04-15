import { primaryProductImage } from "@/lib/utils";

/**
 * Single source of truth: which `/products/...` file is the vial hero for shop + PDP.
 * Every slug listed here must match a file in `public/product-media/` (URL stays `/products/…`).
 * Most heroes are opaque studio shots (background baked in). A few SKUs use transparent PNGs
 * plus `HERO_FRAME_BACKGROUND_BY_SLUG` (e.g. 5-amino-1mq).
 */
export const PRODUCT_CANONICAL_IMAGE: Record<string, string> = {
  "5-amino-1mq": "/products/amino-1mq-clean-2.png",
  "aod-9604": "/products/aod-9604-clean-2.png",
  "bacteriostatic-water-30ml": "/products/bacteriostatic-water-30ml-clean-2.png",
  "bpc-157": "/products/bpc-157-clean-2.png",
  "bpc-157-ghk-cu-tb-blend": "/products/bpc-157-ghk-cu-tb-blend-clean-2.png",
  "bpc-157-tb-500-blend": "/products/bpc-157-tb-500-blend-clean-2.png",
  "cjc-1295-ipamorelin-blend": "/products/cjc-1295-ipamorelin-blend-clean-2.png",
  "cjc-1295-no-dac": "/products/cjc-1295-no-dac-clean-2.png",
  epitalon: "/products/epitalon-clean-2.png",
  calgrilinitide: "/products/calgrilinitide-clean-2.png",
  dsip: "/products/dsip-clean-2.png",
  glow: "/products/glow-clean-2.png",
  "ghk-cu": "/products/ghk-cu-clean-2.png",
  "igf-1": "/products/igf-1-clean-2.png",
  klow: "/products/klow-clean-2.png",
  kpv: "/products/kpv-clean-2.png",
  "melanotan-i": "/products/melanotan-i-clean-2.png",
  "melanotan-ii": "/products/melanotan-ii-clean-2.png",
  "mots-c": "/products/mots-c-clean-2.png",
  "nad-plus": "/products/nad-plus-clean-2.png",
  "pt-141": "/products/pt141-clean-2.png",
  retatrutide: "/products/retatrutide-clean-2.png",
  selank: "/products/selank-clean-2.png",
  semax: "/products/semax-clean-2.png",
  semaglutide: "/products/semaglutide-clean-2.png",
  "snap-8": "/products/snap-8-clean-2.png",
  "tb-500": "/products/tb-500-clean-2.png",
  "thymosin-alpha-1": "/products/thymosin-alpha-1-clean-2.png",
  tesamorelin: "/products/tesamorelin-clean-2.png",
  glutathione: "/products/glutathione-clean-2.png",
};

/** Case-insensitive match so DB slugs still resolve (shop/research grid + PDP). */
const CANONICAL_IMAGE_BY_SLUG_LOWER = new Map(
  Object.entries(PRODUCT_CANONICAL_IMAGE).map(([k, v]) => [k.toLowerCase(), v]),
);

function themeSlugKey(slug: string): string {
  return slug.trim().toLowerCase();
}

export function getCanonicalProductImage(slug: string, mergedImages: string[]): string {
  const path = CANONICAL_IMAGE_BY_SLUG_LOWER.get(themeSlugKey(slug));
  if (path) return path;
  return primaryProductImage(mergedImages);
}

/** Shop listing only (`/shop`, `/shop/[category]`). Homepage featured art is separate — do not use here. */
const SHOP_GRID_IMAGE_BY_SLUG_LOWER = new Map<string, string>([
  ["bpc-157", "/products/bpc-157-shop.png"],
]);

export function getShopGridProductImage(slug: string, mergedImages: string[]): string {
  const override = SHOP_GRID_IMAGE_BY_SLUG_LOWER.get(themeSlugKey(slug));
  if (override) return override;
  return getCanonicalProductImage(slug, mergedImages);
}

/**
 * Backdrop for shop product cards when the listing uses an opaque studio shot (matches edges of baked-in background).
 */
export function getProductShopGridBackgroundCss(slug: string): string | undefined {
  const key = themeSlugKey(slug);
  if (key === "bpc-157") {
    return "linear-gradient(165deg, #2d2d32 0%, #161618 50%, #0f0f11 100%)";
  }
  return getProductHeroBackgroundCss(slug);
}

export function getShopGridImageObjectFit(slug: string): "cover" | "contain" | undefined {
  return themeSlugKey(slug) === "bpc-157" ? "contain" : undefined;
}

/**
 * Optional CSS `background` for the product image frame (shop grid + PDP + research PDP).
 * Use when the vial PNG has transparent edges and the label uses a distinct color story
 * (matches HALVECO label gradient for that SKU).
 */
const HERO_FRAME_BACKGROUND_BY_SLUG = new Map<string, string>([
  // 5-Amino-1MQ: transparent hero; gradient behind frame (Semax / Selank / DSIP / Thymosin use baked backgrounds in PNG)
  [
    "5-amino-1mq",
    "linear-gradient(150deg, #152c4a 0%, #3a2852 36%, #6b2848 68%, #4a2038 100%)",
  ],
]);

export function getProductHeroBackgroundCss(slug: string): string | undefined {
  return HERO_FRAME_BACKGROUND_BY_SLUG.get(themeSlugKey(slug));
}
