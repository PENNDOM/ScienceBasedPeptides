import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoyaltyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Rewards</h1>
      <p className="mt-4 text-[var(--text-muted)]">
        Rewards and points are currently unavailable.
      </p>
      <Button className="mt-6" variant="secondary" asChild>
        <Link href="/account">Back to account</Link>
      </Button>
    </div>
  );
}
