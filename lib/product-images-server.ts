import fs from "fs";
import path from "path";
import { orderedProductImages } from "@/lib/utils";

const IMAGE_EXT = /\.(png|webp|jpe?g|svg)$/i;

/**
 * Filenames in `public/products` (flat; excludes subfolders like `showcase/`).
 * Call once per request when rendering many products, then pass into merge.
 */
export function listPublicProductFilenames(): string[] {
  const dir = path.join(process.cwd(), "public", "products");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => {
    if (!IMAGE_EXT.test(name)) return false;
    try {
      return fs.statSync(path.join(dir, name)).isFile();
    } catch {
      return false;
    }
  });
}

/** URLs under `/products/…` that belong to this slug (same rules as seed). */
export function diskImageUrlsForSlug(slug: string, filenames: string[]): string[] {
  const lowerSlug = slug.toLowerCase();
  const out: string[] = [];
  for (const file of filenames) {
    const lower = file.toLowerCase();
    if (!IMAGE_EXT.test(lower)) continue;
    const base = lower.replace(IMAGE_EXT, "");
    if (base === lowerSlug || base.startsWith(`${lowerSlug}-`)) {
      out.push(`/products/${file}`);
    }
  }
  return out;
}

/**
 * Merges DB `images` with files on disk so `*-clean-2.png` etc. are always candidates
 * even when the database only lists a legacy `slug.png`.
 * Server-only — do not import from client components.
 */
export function mergeProductImagesWithDisk(
  slug: string,
  dbImages: string[],
  allFilenames?: string[],
): string[] {
  const files = allFilenames ?? listPublicProductFilenames();
  const fromDisk = diskImageUrlsForSlug(slug, files);
  const merged = [...new Set([...(dbImages ?? []).filter(Boolean), ...fromDisk])];
  return orderedProductImages(merged);
}
