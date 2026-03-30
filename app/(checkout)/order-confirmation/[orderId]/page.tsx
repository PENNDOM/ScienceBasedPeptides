import Link from "next/link";
import getDb from "@/db/index";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FooterDisclaimer } from "@/components/ui/disclaimer";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const db = getDb();
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as Record<string, unknown> | undefined;
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>Order not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Badge variant="warning">Awaiting crypto confirmation</Badge>
      <h1 className="font-display mt-4 text-3xl font-semibold">Order {orderId.slice(0, 8).toUpperCase()}</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Status: {order.status as string}</p>
      <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-surface p-6 font-mono text-sm">
        <p>
          Send exactly: {String(order.crypto_amount)} {String(order.crypto_currency)}
        </p>
        <p className="mt-4 break-all">Wallet: {String(order.crypto_wallet_sent_to)}</p>
        {order.crypto_tx_hash ? <p className="mt-4">Tx hash submitted: {String(order.crypto_tx_hash)}</p> : null}
      </div>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Typical processing: 1–3 business days after payment confirms.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/account">View account</Link>
        </Button>
      </div>
      <div className="mt-12">
        <FooterDisclaimer />
      </div>
    </div>
  );
}
