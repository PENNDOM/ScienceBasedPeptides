"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: true }),
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { newlySubscribed?: boolean };
      setMsg(data.newlySubscribed ? "Thanks — you are on the list." : "You're already subscribed.");
      setEmail("");
    } else {
      setMsg("Could not subscribe. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="you@lab.edu"
        className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-4 text-sm text-[var(--text)] md:w-80"
      />
      <Button type="submit">Subscribe</Button>
      {msg ? <p className="text-sm text-[var(--text-muted)] sm:w-full">{msg}</p> : null}
    </form>
  );
}
