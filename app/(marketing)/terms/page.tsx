import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1 className="font-display text-4xl font-semibold">Terms of service</h1>
      <p className="mt-6 text-[var(--text-muted)]">
        By using this site you agree that products are sold for research use only, not for human consumption, and not
        for veterinary use unless your jurisdiction permits and you maintain appropriate licenses. You are responsible
        for compliance with local laws. We disclaim all warranties to the fullest extent permitted by law.
      </p>
      <p className="mt-4 text-[var(--text-muted)] text-sm">
        For research purposes only. Not for human consumption. These statements have not been evaluated by the FDA.
        This product is not intended to diagnose, treat, cure, or prevent any disease.
      </p>
    </div>
  );
}
