"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function AgeGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLegalPage = pathname === "/terms" || pathname === "/privacy";

  useEffect(() => {
    if (isLegalPage) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [isLegalPage]);

  const agree = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={() => {}} title="Research materials catalog" className="max-w-md" hideClose>
      <p className="text-sm text-[var(--text-muted)]">
        This catalog lists analytical and laboratory research compounds for qualified institutional use only. You must be
        18 or older to continue.
      </p>
      <div className="mt-4 space-y-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <p className="text-sm text-[var(--text)]">I confirm I am 18 years of age or older.</p>
        <p className="text-sm text-[var(--text)]">
          I agree to the{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" type="button" onClick={() => (window.location.href = "https://www.google.com")}>
          Exit
        </Button>
        <Button type="button" onClick={agree}>
          I agree
        </Button>
      </div>
    </Modal>
  );
}
