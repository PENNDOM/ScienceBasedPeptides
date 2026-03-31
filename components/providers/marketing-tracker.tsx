"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MarketingTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionIdKey = "mk:session-id";
    let sessionId = window.sessionStorage.getItem(sessionIdKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window.sessionStorage.setItem(sessionIdKey, sessionId);
    }
    const sessionKey = `mk-open:${window.location.pathname}:${window.location.search}`;
    if (window.sessionStorage.getItem(sessionKey)) return;
    window.sessionStorage.setItem(sessionKey, "1");

    const source = pathname.startsWith("/ref/") ? "referral_link" : "organic_site_open";
    void fetch("/api/marketing/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-session-key": sessionId },
      body: JSON.stringify({
        eventType: "site_open",
        source,
        path: pathname,
      }),
      keepalive: true,
    });
  }, [pathname]);

  return null;
}

