"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; total: number; status: string; created_at: number }>>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/account/orders-preview");
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders ?? []);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Orders</h1>
      <div className="mt-8 space-y-2">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-surface px-4 py-3"
          >
            <span className="font-mono">{o.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-sm text-[var(--text-muted)]">{formatDate(o.created_at)}</span>
            <span>{formatCurrency(o.total)}</span>
            <span className="text-xs uppercase text-accent">{o.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
