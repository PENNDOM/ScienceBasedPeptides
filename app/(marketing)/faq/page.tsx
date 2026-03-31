import type { Metadata } from "next";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { Container, SectionHeading } from "@/components/ui/shell";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    q: "Are products tested?",
    a: "Each catalog item includes a certificate of analysis (COA) from an independent lab. Batch numbers are tied to documentation you can download from the product page.",
  },
  {
    q: "How does payment work?",
    a: "Checkout provides cryptocurrency payment instructions with an exact amount and wallet address. You may submit a transaction hash after sending to help operations confirm faster.",
  },
  {
    q: "How is outbound packaging handled?",
    a: "Orders ship in plain outer cartons without promotional branding. Carrier tracking is provided when the shipment departs.",
  },
];

export default function FaqPage() {
  return (
    <Container className="section-shell max-w-3xl">
      <SectionHeading>FAQ</SectionHeading>
      <div className="mt-10 space-y-8">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="text-lg font-semibold">{f.q}</h2>
            <p className="mt-2 text-[var(--text-muted)]">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 max-w-3xl">
        <FooterDisclaimer />
      </div>
    </Container>
  );
}
