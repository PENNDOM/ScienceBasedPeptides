"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Order = { id: string; guest_email: string | null; status: string; total: number; created_at: number; user_id: string | null };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/orders-list");
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders ?? []);
      }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    if (status && o.status !== status) return false;
    if (!q) return true;
    return o.id.includes(q) || (o.guest_email ?? "").includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Orders</h1>
      <div className="mt-6 flex flex-wrap gap-4">
        <Input placeholder="Search ID or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="h-10 rounded-md border border-[var(--border)] bg-surface-2 px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending_payment">pending_payment</option>
          <option value="awaiting_confirmation">awaiting_confirmation</option>
          <option value="confirmed">confirmed</option>
          <option value="shipped">shipped</option>
        </select>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="py-2">ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-[var(--border)]">
                <td className="py-3 font-mono">{o.id.slice(0, 8)}</td>
                <td>{o.guest_email ?? o.user_id?.slice(0, 6) ?? "—"}</td>
                <td>{formatDate(o.created_at)}</td>
                <td className="font-mono">{formatCurrency(o.total)}</td>
                <td>{o.status}</td>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="text-accent underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
