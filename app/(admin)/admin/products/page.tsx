"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/products");
      if (res.ok) setProducts((await res.json()).products ?? []);
    })();
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="text-accent underline">
          New
        </Link>
      </div>
      <ul className="mt-8 space-y-2">
        {products.map((p) => (
          <li key={String(p.id)} className="flex justify-between rounded border border-[var(--border)] px-4 py-3">
            <span>{String(p.name)}</span>
            <Link href={`/admin/products/${p.id}/edit`} className="text-accent underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
