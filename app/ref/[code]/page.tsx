"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RefPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    void fetch("/api/referrals/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).finally(() => {
      router.replace(`/register?ref=${encodeURIComponent(code)}`);
    });
  }, [code, router]);

  return (
    <div className="p-12 text-center text-[var(--text-muted)]">
      Applying referral…
    </div>
  );
}
