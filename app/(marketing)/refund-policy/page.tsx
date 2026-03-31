import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPage() {
  return (
    <Container className="section-shell max-w-3xl">
      <SectionHeading>Refund policy</SectionHeading>
      <p className="mt-6 text-[var(--text-muted)] leading-relaxed">
        Research materials are non-returnable once shipped unless damaged in transit or mislabeled. Report issues within
        48 hours of delivery with photos and batch numbers. Crypto payments are irreversible; refunds, when approved, may
        be issued as store credit unless otherwise required by law.
      </p>
    </Container>
  );
}
