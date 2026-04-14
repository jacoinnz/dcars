"use client";

import { useEffect } from "react";

/** Scrolls the main content to `#id` when the URL contains a hash (sidebar anchor links). */
export function DashboardScrollToHash() {
  useEffect(() => {
    const scrollToId = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    scrollToId();
    window.addEventListener("hashchange", scrollToId);
    return () => window.removeEventListener("hashchange", scrollToId);
  }, []);

  return null;
}
