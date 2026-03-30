import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getMdxSlugs } from "@/lib/mdx";
import { DEFAULT_SITE_URL } from "@/lib/site";

const base = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.products.findMany({ select: { slug: true, created_at: true } });
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/shop`, lastModified: new Date() },
    { url: `${base}/bundles`, lastModified: new Date() },
    { url: `${base}/research`, lastModified: new Date() },
    { url: `${base}/protocols`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/faq`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ];

  for (const p of products) {
    entries.push({ url: `${base}/products/${p.slug}`, lastModified: new Date(Number(p.created_at) * 1000) });
  }

  for (const slug of getMdxSlugs("research")) {
    entries.push({ url: `${base}/research/${slug}`, lastModified: new Date() });
  }
  for (const slug of getMdxSlugs("protocols")) {
    entries.push({ url: `${base}/protocols/${slug}`, lastModified: new Date() });
  }

  return entries;
}
