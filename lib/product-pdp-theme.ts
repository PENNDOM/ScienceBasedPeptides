import { primaryProductImage } from "@/lib/utils";

/**
 * Single source of truth: which `/products/...` file is the vial hero for shop + PDP.
 * Every slug listed here must match a file in `public/products/`.
 */
export const PRODUCT_CANONICAL_IMAGE: Record<string, string> = {
  "bacteriostatic-water-30ml": "/products/bacteriostatic-water-30ml-clean-2.png",
  "bpc-157": "/products/bpc-157-clean-2.png",
  "bpc-157-ghk-cu-tb-blend": "/products/bpc-157-ghk-cu-tb-blend-clean-2.png",
  "bpc-157-tb-500-blend": "/products/bpc-157-tb-500-blend-clean-2.png",
  "cjc-1295-ipamorelin-blend": "/products/cjc-1295-ipamorelin-blend-clean-2.png",
  "cjc-1295-no-dac": "/products/cjc-1295-no-dac-clean-2.png",
  "ghk-cu": "/products/ghk-cu-clean-2.png",
  "melanotan-i": "/products/melanotan-i-clean-2.png",
  "melanotan-ii": "/products/melanotan-ii-clean-2.png",
  "nad-plus": "/products/nad-plus-clean-2.png",
  retatrutide: "/products/retatrutide-clean-2.png",
  semaglutide: "/products/semaglutide-clean-2.png",
  "tb-500": "/products/tb-500-clean-2.png",
  tesamorelin: "/products/tesamorelin-clean-2.png",
};

/**
 * Vertical gradients (lighter top → darker bottom) behind vials — must match shop cards and PDP.
 */
export const PRODUCT_PDP_GRADIENT: Record<string, string> = {
  "bacteriostatic-water-30ml":
    "linear-gradient(180deg, #B8DDF5 0%, #5A8EB8 48%, #3D6A8A 100%)",
  "bpc-157": "linear-gradient(180deg, #6B9FE8 0%, #3D6AB8 45%, #1E3D6E 100%)",
  "bpc-157-ghk-cu-tb-blend":
    "linear-gradient(180deg, #4A6B5C 0%, #2D4A3E 48%, #1A2E28 100%)",
  "bpc-157-tb-500-blend":
    "linear-gradient(180deg, #B8E8D8 0%, #7AB89A 50%, #4A7A68 100%)",
  "cjc-1295-no-dac":
    "linear-gradient(180deg, #D4C8F0 0%, #A898D0 48%, #7A6A9E 100%)",
  "cjc-1295-ipamorelin-blend":
    "linear-gradient(180deg, #8A6AB0 0%, #5A3A78 50%, #2E1A40 100%)",
  "ghk-cu":
    "linear-gradient(180deg, #F5E8A8 0%, #E8D060 45%, #B89828 100%)",
  "melanotan-i": "linear-gradient(180deg, #E8C8A8 0%, #C6A68A 50%, #8A7058 100%)",
  "melanotan-ii": "linear-gradient(180deg, #A08068 0%, #6B4A38 50%, #3D2818 100%)",
  "nad-plus": "linear-gradient(180deg, #F0A898 0%, #C86858 48%, #8A4038 100%)",
  retatrutide: "linear-gradient(180deg, #E85060 0%, #B02038 50%, #681018 100%)",
  semaglutide:
    "linear-gradient(180deg, #E89848 0%, #C04838 45%, #681828 100%)",
  "tb-500": "linear-gradient(180deg, #A8E8C8 0%, #68C898 50%, #2A7850 100%)",
  tesamorelin: "linear-gradient(180deg, #3D7A54 0%, #1E4D32 50%, #0E2818 100%)",
};

const DEFAULT_PDP_GRADIENT =
  "linear-gradient(180deg, #3A3F48 0%, #252830 50%, #14161A 100%)";

export function getCanonicalProductImage(slug: string, mergedImages: string[]): string {
  const path = PRODUCT_CANONICAL_IMAGE[slug];
  if (path) return path;
  return primaryProductImage(mergedImages);
}

export function getPdpHeroGradient(slug: string): string {
  return PRODUCT_PDP_GRADIENT[slug] ?? DEFAULT_PDP_GRADIENT;
}
