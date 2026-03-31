import Image from "next/image";
import { cn } from "@/lib/utils";

export function CryptoQR({
  address,
  qrDataUrl,
  className,
}: {
  address: string;
  qrDataUrl: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-4 text-center", className)}>
      <div className="mx-auto aspect-square w-48 overflow-hidden rounded-md bg-white p-2">
        <Image src={qrDataUrl} alt="" width={200} height={200} unoptimized className="h-full w-full object-contain" />
      </div>
      <p className="mt-3 break-all font-mono text-xs text-[var(--text-muted)]">{address}</p>
    </div>
  );
}
