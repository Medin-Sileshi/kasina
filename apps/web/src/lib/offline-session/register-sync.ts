"use client";

import { flushSyncQueue } from "./sync";

let registered = false;

export function registerOfflineSync() {
  if (typeof window === "undefined" || registered) return;
  registered = true;

  const flush = () => {
    void flushSyncQueue().catch(() => {
      /* ignore; retry next online */
    });
  };

  window.addEventListener("online", flush);
  if (navigator.onLine) flush();
}
