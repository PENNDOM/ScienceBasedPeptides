import fs from "fs";
import path from "path";

/** Homepage featured section: optional hand-placed transparent PNG in `public/products/showcase/<same basename>`. Not auto-generated. */
export function resolveShowcaseImageUrl(productImagePath: string): string {
  if (!productImagePath.startsWith("/products/")) return productImagePath;
  const basename = path.basename(productImagePath);
  const full = path.join(process.cwd(), "public", "products", "showcase", basename);
  if (fs.existsSync(full)) {
    return `/products/showcase/${basename}`;
  }
  return productImagePath;
}
