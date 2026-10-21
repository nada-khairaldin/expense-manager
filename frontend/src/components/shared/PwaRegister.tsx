"use client";

import * as React from "react";

export function PwaRegister() {
  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            // Service worker registered safely
          })
          .catch(() => {
            // Silently handle registration errors in non-HTTPS / dev environments
          });
      });
    }
  }, []);

  return null;
}
