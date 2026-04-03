/**
 * Rewrites each product's `images` JSON to the merged + ordered list (DB + public/products).
 * Run after deploy or seed: npx tsx scripts/canonicalize-product-images.ts
 */
import { config } from "dotenv";
import path from "path";
import { prisma } from "@/lib/prisma";
import { mergeProductImagesWithDisk, listPublicProductFilenames } from "@/lib/product-images-server";
import { parseJsonArray } from "@/lib/utils";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const files = listPublicProductFilenames();
  const rows = await prisma.products.findMany({ select: { id: true, slug: true, images: true } });
  let updated = 0;
  for (const row of rows) {
    const slug = row.slug as string;
    const parsed = parseJsonArray<string>(row.images as string, []);
    const next = mergeProductImagesWithDisk(slug, parsed, files);
    const prev = JSON.stringify(parsed);
    const json = JSON.stringify(next);
    if (json === prev) continue;
    await prisma.products.update({
      where: { id: row.id },
      data: { images: json },
    });
    updated += 1;
    console.log(`${slug}: updated images (${next[0] ?? "?"})`);
  }
  console.log(`Done. Updated ${updated}/${rows.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
