"use client";

import * as React from "react";

let didTrack = false;

export default function VisitorTrack() {
  React.useEffect(() => {
    if (didTrack) return;
    didTrack = true;

    const payload = {
      path: window.location.pathname,
      referrer: document.referrer || "",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      lang: navigator.language || "",
    };

    // Best-effort
    void fetch("/api/visitor/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
