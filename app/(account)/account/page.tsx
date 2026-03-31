"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Share2, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

type DashboardPayload = {
  account: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: number;
    status: string;
    referralCode: string;
  };
  orders: Array<{ id: string; total: number; status: string; created_at: number }>;
  referralPerformance: {
    totalReferrals: number;
    clicks: number;
    conversions: number;
    referredOrders: number;
    estimatedCommissions: number;
  };
};

export default function AccountDashboard() {
  const persistedUser = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyLinkState, setCopyLinkState] = useState<"idle" | "copied">("idle");
  const [copyCodeState, setCopyCodeState] = useState<"idle" | "copied">("idle");

  const referralUrl = useMemo(() => {
    const code = data?.account.referralCode || persistedUser?.referralCode;
    if (!code || typeof window === "undefined") return "";
    return `${window.location.origin}/ref/${code}`;
  }, [data?.account.referralCode, persistedUser?.referralCode]);

  const loadDashboard = async () => {
    const res = await fetch("/api/account/dashboard", { credentials: "include" });
    if (!res.ok) return;
    const payload = (await res.json()) as DashboardPayload;
    setData(payload);
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!cancelled) {
          await loadDashboard();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    const interval = window.setInterval(() => {
      void loadDashboard();
    }, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const account = data?.account;
  const orders = data?.orders ?? [];
  const performance = data?.referralPerformance ?? {
    totalReferrals: 0,
    clicks: 0,
    conversions: 0,
    referredOrders: 0,
    estimatedCommissions: 0,
  };

  const displayName = account?.name?.trim() || persistedUser?.name?.trim() || "Not provided";
  const displayEmail = account?.email || persistedUser?.email || "Not available";
  const displayCode = account?.referralCode || persistedUser?.referralCode || "Not available";
  const memberSince =
    account?.createdAt != null
      ? new Date(Number(account.createdAt) * 1000).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not available";

  async function onCopyLink() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopyLinkState("copied");
    window.setTimeout(() => setCopyLinkState("idle"), 1200);
  }

  async function onCopyCode() {
    if (!displayCode || displayCode === "Not available") return;
    await navigator.clipboard.writeText(displayCode);
    setCopyCodeState("copied");
    window.setTimeout(() => setCopyCodeState("idle"), 1200);
  }

  async function onShare() {
    if (!referralUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Science Based Peptides Affiliate Link",
        text: "Check out Science Based Peptides using my referral link.",
        url: referralUrl,
      });
      return;
    }
    await onCopyLink();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Account</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Manage your account, orders, and affiliate referrals.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-[var(--text-muted)]">
            <span className="font-medium">Affiliate Code:</span>
            <span className="font-mono text-accent">{displayCode}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-surface p-6 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-8 w-8 text-accent" />
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Account Overview</h2>
              <p className="text-xs text-[var(--text-muted)]">Primary account details and member profile status.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            {[
              { label: "Full Name", value: displayName },
              { label: "Email Address", value: displayEmail },
              { label: "Member Since", value: memberSince },
              { label: "Account Status", value: account?.status ?? "Active" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-surface-2/70 px-4 py-3">
                <p className="text-[var(--text-muted)]">{row.label}</p>
                <p className="font-medium text-right">{loading ? "Loading..." : row.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(145deg,rgba(16,26,31,0.96),rgba(13,20,24,0.96))] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Your Affiliate Link</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Share your unique referral link and earn commission on qualifying referrals.
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Referral code</p>
              <p className="mt-1 font-mono text-base text-accent">{displayCode}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Referral URL</p>
              <p className="mt-1 break-all text-sm">{referralUrl || "Loading referral URL..."}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onCopyLink} disabled={!referralUrl}>
              <Copy className="mr-1.5 h-4 w-4" />
              {copyLinkState === "copied" ? "Copied" : "Copy Link"}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onCopyCode} disabled={displayCode === "Not available"}>
              <Copy className="mr-1.5 h-4 w-4" />
              {copyCodeState === "copied" ? "Copied" : "Copy Code"}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onShare} disabled={!referralUrl}>
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">This link is unique to your account.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total Referrals", value: performance.totalReferrals },
              { label: "Total Orders Referred", value: performance.referredOrders },
              { label: "Estimated Commissions", value: `$${performance.estimatedCommissions.toFixed(2)}` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[var(--border)] bg-surface px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-surface p-6 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-accent hover:text-[var(--accent-hover)]">
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-surface-2/60 p-5">
              <p className="font-medium">No orders yet.</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">When you place an order, it will appear here.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="rounded-xl border border-[var(--border)] bg-surface-2/70 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-sm">{o.id.slice(0, 8)}</p>
                    <p className="text-sm capitalize text-[var(--text-muted)]">{String(o.status).replaceAll("_", " ")}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(Number(o.created_at) * 1000).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm">${Number(o.total).toFixed(2)}</p>
                      <Link href={`/account/orders/${o.id}`} className="inline-flex items-center text-xs text-accent hover:text-[var(--accent-hover)]">
                        View details <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-surface p-6 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Affiliate Performance</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Performance data updates as referral activity is recorded.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Clicks", value: performance.clicks },
              { label: "Conversions", value: performance.conversions },
              { label: "Referred Orders", value: performance.referredOrders },
              { label: "Estimated Earnings", value: `$${performance.estimatedCommissions.toFixed(2)}` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[var(--border)] bg-surface-2/70 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {!data && !loading ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Unable to load account details right now. Please refresh.</p>
      ) : null}
      {loading ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading account dashboard...</p>
      ) : null}
    </div>
  );
}
