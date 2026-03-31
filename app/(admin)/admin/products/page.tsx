"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, SectionHeading } from "@/components/ui/shell";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/products");
      if (res.ok) setProducts((await res.json()).products ?? []);
    })();
  }, []);
  return (
    <Container className="section-shell max-w-6xl">
      <div className="flex items-center justify-between">
        <SectionHeading>Products</SectionHeading>
        <Link href="/admin/products/new" className="text-accent underline">
          New
        </Link>
      </div>
      <ul className="mt-8 space-y-2">
        {products.map((p) => (
          <li key={String(p.id)} className="flex justify-between rounded-[var(--radius)] border border-[var(--border)] bg-surface px-4 py-3 shadow-card">
            <span>{String(p.name)}</span>
            <Link href={`/admin/products/${p.id}/edit`} className="text-accent underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
