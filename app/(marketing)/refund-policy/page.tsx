import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-semibold">Refund policy</h1>
      <p className="mt-6 text-[var(--text-muted)] leading-relaxed">
        Research materials are non-returnable once shipped unless damaged in transit or mislabeled. Report issues within
        48 hours of delivery with photos and batch numbers. Crypto payments are irreversible; refunds, when approved, may
        be issued as store credit unless otherwise required by law.
      </p>
    </div>
  );
}
