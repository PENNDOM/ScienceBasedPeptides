import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Handshake, Share2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export const metadata: Metadata = {
  title: "Referral Program",
  description: "Become a Science Based Peptides affiliate and earn commission on qualified referral orders.",
};

const steps = [
  {
    title: "Apply",
    description: "Submit a short application so we can review fit and channel quality.",
    icon: ClipboardCheck,
  },
  {
    title: "Get approved",
    description: "Approved affiliates receive a unique referral link and onboarding notes.",
    icon: CheckCircle2,
  },
  {
    title: "Share your link",
    description: "Place your link across your channels with clear, compliant messaging.",
    icon: Share2,
  },
  {
    title: "Earn commission",
    description: "Qualified tracked orders are credited to your account and paid on schedule.",
    icon: Wallet,
  },
];

const benefits = [
  "Competitive commissions on qualified orders",
  "Recurring earnings from repeat referral customers",
  "Attribution tracking for approved affiliate links",
  "Scheduled payouts with transparent reporting",
];

const reasons = [
  {
    title: "Quality-first catalog",
    body: "Research compounds are listed with clear specifications and lot-level documentation standards.",
  },
  {
    title: "Documentation confidence",
    body: "Batch COA workflows and verification practices support trust-focused affiliate positioning.",
  },
  {
    title: "Focused demand",
    body: "A research-driven niche audience supports high-intent referral traffic and better conversion quality.",
  },
];

const faqs = [
  {
    q: "How are payouts handled?",
    a: "Payouts are processed on a scheduled cycle for approved affiliates after referral verification and standard hold windows.",
  },
  {
    q: "Who can apply?",
    a: "Researchers, educators, and compliant content affiliates with relevant audiences may apply for review.",
  },
  {
    q: "How are referrals tracked?",
    a: "Each approved affiliate receives a unique link, and qualified orders are attributed through that tracking flow.",
  },
  {
    q: "When do earnings appear?",
    a: "Referred orders appear after successful placement and are finalized once verification conditions are met.",
  },
  {
    q: "Can I promote on multiple channels?",
    a: "Yes. Approved affiliates can use multiple channels as long as messaging remains compliant and accurate.",
  },
];

export default function ReferralsMarketingPage() {
  return (
    <div className="bg-[#040908]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(24,211,190,0.08),transparent_56%)]" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center md:px-6 md:py-28">
          <p className="inline-flex rounded-full border border-[var(--border)] bg-surface px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Affiliate Program
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Become a Science Based Peptides Affiliate
          </h1>
          <div className="mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: "20%", l: "First-order commission" },
              { v: "10%", l: "Recurring commission" },
              { v: "30 days", l: "Referral cookie window" },
              { v: "Monthly", l: "Payout cadence" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-surface px-5 py-5"
              >
                <p className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{s.v}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/contact">Become an affiliate</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="#how-it-works">Program details</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <CardContent className="p-6">
                  <Icon className="h-5 w-5 text-accent" />
                  <p className="mt-4 font-semibold">{step.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Commission and benefits</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {benefits.map((item) => (
              <div key={item} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-5 text-sm text-[var(--text-muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Why join us</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reasons.map((reason) => (
            <Card key={reason.title}>
              <CardContent className="p-6">
                <Handshake className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold">{reason.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{reason.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Earnings example</h2>
          <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-6 md:p-8">
            <p className="text-2xl font-semibold tracking-tight">
              Refer 10 qualified customers <span className="text-[var(--text-muted)]">→</span> earn affiliate commission
            </p>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Final payout varies by approved commission terms, product mix, and order volume. No guaranteed earnings.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-surface p-8 md:p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Start earning today</h2>
          <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
            Apply to the Science Based Peptides affiliate program and get reviewed for referral access.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/contact">Apply now</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface px-5 py-4">
                <summary className="cursor-pointer list-none pr-6 font-medium">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10">
            <FooterDisclaimer />
          </div>
        </div>
      </section>
    </div>
  );
}
