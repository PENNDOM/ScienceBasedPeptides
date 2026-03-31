import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Container className="section-shell max-w-3xl prose prose-invert">
      <SectionHeading>Terms of service</SectionHeading>
      <p className="mt-6 text-[var(--text-muted)]">
        By using this site you agree that products are sold for research use only, not for human consumption, and not
        for veterinary use unless your jurisdiction permits and you maintain appropriate licenses. You are responsible
        for compliance with local laws. We disclaim all warranties to the fullest extent permitted by law.
      </p>
      <p className="mt-4 text-[var(--text-muted)] text-sm">
        For research purposes only. Not for human consumption. These statements have not been evaluated by the FDA.
        This product is not intended to diagnose, treat, cure, or prevent any disease.
      </p>
    </Container>
  );
}
