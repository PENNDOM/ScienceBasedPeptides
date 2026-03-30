import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const bundles = (await prisma.bundles.findMany({ where: { is_active: 1 } })) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Research sets</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Pre-defined multi-compound bundles at a discount versus separate catalog purchase.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {bundles.map((b) => (
          <Card key={b.id as string}>
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">{b.name as string}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{b.description as string}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-2xl">{formatCurrency(b.price as number)}</span>
                <span className="font-mono text-sm text-[var(--text-muted)] line-through">
                  {formatCurrency(b.compare_at as number)}
                </span>
                <span className="text-xs text-accent">{b.discount_percent as number}% off</span>
              </div>
              <Button className="mt-6" asChild>
                <Link href={`/shop`}>Shop components</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-12 max-w-3xl">
        <FooterDisclaimer />
      </div>
    </div>
  );
}
