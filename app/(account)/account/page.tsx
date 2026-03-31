"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

export default function AccountDashboard() {
  const user = useAuthStore((s) => s.user);
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-[var(--text-muted)]">{user?.email}</p>
      <h2 className="font-display mt-12 text-xl font-semibold">Recent orders</h2>
      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="flex justify-between rounded-[var(--radius)] border border-[var(--border)] bg-surface px-4 py-3 text-sm hover:border-accent/40"
          >
            <span className="font-mono">{o.id.slice(0, 8)}</span>
            <span>{o.status}</span>
          </Link>
        ))}
        {orders.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No orders yet.</p> : null}
      </div>
    </div>
  );
}
