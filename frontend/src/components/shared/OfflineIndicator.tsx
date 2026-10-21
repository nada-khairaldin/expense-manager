"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";

function getSnapshot() {
  return typeof navigator !== "undefined" ? !navigator.onLine : false;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineIndicator() {
  const isOffline = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 inset-x-4 z-50 max-w-md mx-auto flex items-center justify-between gap-3 p-3 rounded-2xl bg-brand-primary text-white text-xs font-semibold shadow-lg border border-border animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-brand-gold shrink-0 animate-pulse" />
        <span>أنت تعمل في وضع عدم الاتصال حالياً.</span>
      </div>
      <span className="text-[10px] text-text-muted bg-white/10 px-2 py-0.5 rounded-md">
        غير متصل
      </span>
    </div>
  );
}
