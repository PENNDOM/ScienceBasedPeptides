import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listPublicProductFilenames, mergeProductImagesWithDisk } from "@/lib/product-images-server";
import { getCanonicalProductImage, getProductHeroBackgroundCss } from "@/lib/product-pdp-theme";
import { parseJsonArray } from "@/lib/utils";
import { parseProductMeta } from "@/lib/product-meta";
import { buildPdpSpecificationRows } from "@/lib/product-specifications";
import { CoaRequestForm } from "@/components/shop/coa-request-form";
import { Disclaimer } from "@/components/ui/disclaimer";

export const dynamic = "force-dynamic";

export default async function ProductResearchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.products.findFirst({
    where: { slug, is_active: 1 },
  });
  if (!p) notFound();

  const category = await prisma.categories.findFirst({
    where: { id: p.category_id },
    select: { name: true },
  });

  const tags = parseJsonArray<string>(p.tags, []);
  const meta = parseProductMeta(tags);
  const variants = await prisma.variants.findMany({
    where: { product_id: p.id },
    orderBy: { display_order: "asc" },
    select: { size: true },
  });
  const defaultSize = variants[0]?.size ?? "—";
  const specificationRows = buildPdpSpecificationRows({
    slug: p.slug as string,
    name: p.name as string,
    scientificName: p.scientific_name as string | null,
    selectedSize: defaultSize,
    meta,
  });
  const productFiles = listPublicProductFilenames();
  const merged = mergeProductImagesWithDisk(p.slug as string, parseJsonArray<string>(p.images, []), productFiles);
  const image = getCanonicalProductImage(p.slug as string, merged);
  const heroFrameBg = getProductHeroBackgroundCss(p.slug as string);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-28 pt-10 md:grid-cols-[minmax(240px,360px)_1fr] md:items-start md:pb-36">
      <div className="space-y-4 md:sticky md:top-24">
        <div
          className={`relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] shadow-sm ${heroFrameBg ? "" : "bg-[var(--surface-2)]"}`}
          style={heroFrameBg ? { background: heroFrameBg } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={p.name}
            className="absolute inset-0 z-[1] h-full w-full object-cover object-center [background:none]"
            loading="eager"
            decoding="async"
          />
        </div>
        <Disclaimer />
        <div className="mt-1 text-center">
          <Link href={`/products/${p.slug}`} className="rounded-full border border-accent/40 bg-accent-muted px-5 py-2 text-sm text-accent">
            View product page
          </Link>
        </div>
      </div>

      <div>
        <p className="text-sm text-[var(--text-muted)]">{category?.name ?? "Research"}</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{p.name} Research</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{p.short_description ?? p.description}</p>

        <div className="mt-6 grid gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Type", value: meta.type },
            { label: "Category", value: meta.family },
            { label: "Batch", value: meta.batch },
            { label: "Available sizes", value: variants.map((v) => v.size).join(" / ") || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-1 font-mono text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{p.description}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Compound overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{p.short_description ?? p.description}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Storage &amp; handling</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {p.storage_instructions ??
                "Store lyophilized material per label and COA. Solvent selection and working-solution preparation must follow institutional laboratory SOPs for analytical workflows."}
            </p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="font-display text-xl font-semibold">Specifications</h2>
            <table className="mt-2 w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--border)]">
                {specificationRows.map((spec) => (
                  <tr key={`${spec.label}:${spec.value}`}>
                    <th className="py-2 text-[var(--text-muted)]">{spec.label}</th>
                    <td className="font-mono">{spec.value}</td>
                  </tr>
                ))}
                {p.molecular_formula ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">Molecular formula</th>
                    <td className="font-mono">{p.molecular_formula}</td>
                  </tr>
                ) : null}
                {p.cas_number ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">CAS</th>
                    <td className="font-mono">{p.cas_number}</td>
                  </tr>
                ) : null}
                {p.purity != null ? (
                  <tr>
                    <th className="py-2 text-[var(--text-muted)]">Purity</th>
                    <td className="font-mono">{p.purity}%</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-5">
          <h3 className="font-display text-lg font-semibold">Request Certificate of Analysis (COA)</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Need documentation for this product? Submit your name and email and we will send COA details.
          </p>
          <CoaRequestForm productSlug={p.slug as string} productName={p.name as string} />
        </div>
      </div>
    </div>
  );
}

