import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  LayoutGrid,
  Link2,
  Repeat2,
  Rocket,
  Share2,
  ShieldCheck,
  Wallet,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: "Become a Science Based Peptides affiliate and earn commission on qualified referral orders.",
};

const steps = [
  {
    title: "Create an account",
    description: "Register your account to access your affiliate dashboard and referral setup.",
    icon: ClipboardCheck,
  },
  {
    title: "Receive Your Link",
    description: "Get your referral code or unique affiliate link for tracking.",
    icon: Link2,
  },
  {
    title: "Share",
    description: "Promote the storefront, products, or collections to your audience.",
    icon: Share2,
  },
  {
    title: "Earn",
    description: "Collect 20% on first orders and 10% recurring on future qualifying purchases.",
    icon: Wallet,
  },
];

const commissionCards = [
  {
    value: "20%",
    title: "First-Order Commission",
    body: "For each qualified first purchase from a new referral, you receive a 20% commission with clear attribution terms.",
    points: ["20% paid on qualifying first orders", "$149 baseline order illustration", "30-day referral attribution window"],
  },
  {
    value: "10%",
    title: "Recurring Commission",
    body: "As referred customers place future qualifying orders, you continue earning recurring commissions at the 10% level.",
    points: ["10% recurring on qualifying reorders", "$149 recurring order illustration", "Bi-weekly payout schedule"],
  },
];

const commissionFooter = [
  { label: "30-day referral window", icon: CalendarClock },
  { label: "Bi-weekly payouts", icon: Wallet },
  { label: "No guaranteed earnings", icon: CheckCircle2 },
];

const whoItsFor = [
  {
    title: "Content Creators",
    body: "For creators who want to refer traffic to a cleaner, premium storefront experience.",
    icon: Rocket,
  },
  {
    title: "Community Builders",
    body: "For private communities, niche audiences, and interest-based groups.",
    icon: Users,
  },
  {
    title: "Referral Partners",
    body: "For partners focused on long-term recurring value rather than one-time promotion.",
    icon: Handshake,
  },
];

const conversionReasons = [
  {
    title: "Premium Presentation",
    body: "Products, collections, and support pages are structured to feel cleaner and more intentional.",
    icon: LayoutGrid,
  },
  {
    title: "Clear Catalog Structure",
    body: "Compounds, blends, and essentials are easier to browse through organized layouts.",
    icon: ShieldCheck,
  },
  {
    title: "Free Shipping",
    body: "All orders ship free, reducing friction during checkout.",
    icon: CheckCircle2,
  },
  {
    title: "Fast Support Response",
    body: "Customers can reach support through a clean on-site flow with quick response expectations.",
    icon: Handshake,
  },
];

const faqs = [
  {
    q: "How much commission do I earn?",
    a: "Affiliates earn 20% on qualifying first orders and 10% recurring on future qualifying purchases tied to their referrals.",
  },
  {
    q: "How often are payouts sent?",
    a: "Payouts are issued on a bi-weekly cadence according to the affiliate program schedule.",
  },
  {
    q: "How long does the referral window last?",
    a: "The current referral attribution window lasts 30 days.",
  },
  {
    q: "Who is this program best for?",
    a: "The affiliate program is designed for creators, communities, and referral partners who align with the brand and storefront.",
  },
  {
    q: "Are earnings guaranteed?",
    a: "No. Earnings vary based on traffic quality, conversion performance, and referral activity.",
  },
  {
    q: "How do I get started?",
    a: "Use the affiliate call-to-action on this page to begin the application or onboarding process.",
  },
];

export default function ReferralsMarketingPage() {
  return (
    <div className="bg-[#040908]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(24,211,190,0.08),transparent_56%),radial-gradient(circle_at_78%_18%,rgba(70,106,255,0.08),transparent_48%)]" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center md:px-6 md:py-28">
          <h1 className="max-w-5xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Become a Science Based Peptides Affiliate
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-relaxed text-[var(--text-muted)] md:text-lg">
            Earn 20% on first orders and 10% recurring commissions.
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
            Partner with a premium research compound storefront built for cleaner presentation, smoother shopping, and
            strong referral potential.
          </p>
          <div className="mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: "20%", l: "First-order commission" },
              { v: "10%", l: "Recurring commission" },
              { v: "30 days", l: "Commission window" },
              { v: "Bi-weekly", l: "Payout cadence" },
            ].map((s) => (
              <div
                key={s.l}
                className="flex min-h-[126px] flex-col items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-surface px-4 py-4 md:min-h-[132px] md:px-5 md:py-5"
              >
                <p className="whitespace-nowrap text-center font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  {s.v}
                </p>
                <p className="mt-1 whitespace-nowrap text-center text-xs text-[var(--text-muted)] md:text-sm">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/account/referrals">Become an affiliate</Link>
            </Button>
          </div>
          <p className="mt-4 max-w-3xl text-xs text-[var(--text-muted)] md:text-sm">
            Built for creators, educators, and communities that value premium presentation and consistent catalog
            structure.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Possible Earning Potential</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
          Illustrative examples to show how recurring commissions can build over time.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { label: "100 first orders x $149 average order", value: "$2,980", sub: "at 20%" },
            { label: "25 recurring orders x $149 average order", value: "$372", sub: "at 10%" },
            { label: "50 recurring orders x $149 average order", value: "$745", sub: "at 10%" },
          ].map((item) => (
            <Card key={item.label} className="border-[var(--border)] bg-surface">
              <CardContent className="p-6">
                <p className="text-sm text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-4 font-display text-4xl font-semibold tracking-tight">{item.value}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-accent/30 bg-[linear-gradient(135deg,rgba(24,211,190,0.12),rgba(10,26,24,0.7))] p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Illustrative monthly total</p>
          <p className="mt-2 font-display text-4xl font-semibold tracking-tight">$3,539</p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Examples are for illustrative purposes only and are not guarantees of earnings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,rgba(14,20,24,0.95),rgba(10,14,18,0.95))] p-6 md:p-8">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Built for High-Quality Affiliate Growth
          </h2>
          <p className="mt-3 text-center text-sm text-[var(--text-muted)] md:text-base">
            Strong first-order upside, recurring commission depth, and a partner fit model built for long-term value.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {commissionCards.map((item) => (
              <Card key={item.title} className="h-full border-[var(--border)] bg-surface/95">
                <CardContent className="flex h-full flex-col items-center p-6 text-center">
                  <p className="font-display text-5xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-2 text-xl font-semibold">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
                  <div className="mt-5 space-y-2.5">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[#0d1418]/80 p-5 md:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Partner Fit</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">Who This Structure Is Built For</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {whoItsFor.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-[var(--border)] bg-surface px-4 py-4">
                    <div className="inline-flex rounded-lg border border-accent/30 bg-accent/10 p-2">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <p className="mt-3 font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {commissionFooter.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[#11181c] px-3 py-2 text-xs text-[var(--text-muted)]">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,rgba(18,30,34,0.92),rgba(14,18,24,0.92))] p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Process</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
          <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
            Get started quickly with a simple four-step process.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border-[var(--border)] bg-[linear-gradient(145deg,rgba(24,34,39,0.95),rgba(16,24,30,0.95))]">
                  <CardContent className="p-6">
                    <Icon className="h-5 w-5 text-accent" />
                    <p className="mt-4 font-semibold">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-center md:text-4xl">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-[var(--radius)] border border-[var(--border)] bg-surface px-5 py-4">
              <summary className="cursor-pointer list-none pr-6 font-medium">{faq.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
          For laboratory research use only. Not for human consumption.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-18 pt-4 md:px-6 md:pb-20 md:pt-4">
        <div className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(140deg,rgba(17,28,28,0.95),rgba(17,17,20,0.95))] p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.28)] md:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">Ready to Become an Affiliate?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
            Join the program and start earning from first orders and recurring commissions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/account/referrals">Become an affiliate</Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 h-px bg-white/10 md:hidden" />
      </section>
    </div>
  );
}
