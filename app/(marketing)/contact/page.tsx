"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-4xl font-semibold">Contact</h1>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        For order-related questions, reference your order ID. General inquiries: use the form below (demo — no backend
        mail without SMTP).
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <Input label="Name" name="name" required />
        <Input label="Email" name="email" type="email" required />
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            name="message"
            required
            className="mt-1 min-h-[120px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-3 text-sm"
          />
        </div>
        <Button type="submit">{sent ? "Sent" : "Send"}</Button>
      </form>
    </div>
  );
}
