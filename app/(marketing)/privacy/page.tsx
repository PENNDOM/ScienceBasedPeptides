import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Container className="section-shell max-w-3xl">
      <SectionHeading>Privacy policy</SectionHeading>
      <p className="mt-6 text-[var(--text-muted)] leading-relaxed">
        We collect account and catalog order information to fulfill laboratory material shipments. Session cookies are
        used for authentication. Operational and marketing emails require appropriate consent. You may request account
        deletion by contacting support.
      </p>
    </Container>
  );
}
