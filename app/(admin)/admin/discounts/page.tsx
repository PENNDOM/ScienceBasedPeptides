import { prisma } from "@/lib/prisma";

function serializeDiscountRow(row: {
  expires_at: bigint | null;
  created_at: bigint;
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_value: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: number;
  applicable_product_ids: string;
}) {
  return {
    ...row,
    expires_at: row.expires_at != null ? Number(row.expires_at) : null,
    created_at: Number(row.created_at),
  };
}

export default async function AdminDiscountsPage() {
  const codes = await prisma.discount_codes.findMany({ orderBy: { code: "asc" } });
  const jsonSafe = codes.map(serializeDiscountRow);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Discount codes</h1>
      <pre className="mt-8 overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-surface p-4 text-xs">
        {JSON.stringify(jsonSafe, null, 2)}
      </pre>
    </div>
  );
}
