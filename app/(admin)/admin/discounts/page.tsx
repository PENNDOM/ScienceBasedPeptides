import { prisma } from "@/lib/prisma";

export default async function AdminDiscountsPage() {
  const codes = await prisma.discount_codes.findMany({ orderBy: { code: "asc" } });
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Discount codes</h1>
      <pre className="mt-8 overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-surface p-4 text-xs">
        {JSON.stringify(codes, null, 2)}
      </pre>
    </div>
  );
}
