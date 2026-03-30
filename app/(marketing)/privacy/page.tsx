import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-semibold">Privacy policy</h1>
      <p className="mt-6 text-[var(--text-muted)] leading-relaxed">
        We collect account and catalog order information to fulfill laboratory material shipments. Session cookies are
        used for authentication. Operational and marketing emails require appropriate consent. You may request account
        deletion by contacting support.
      </p>
    </div>
  );
}
