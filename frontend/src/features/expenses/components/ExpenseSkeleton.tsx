"use client";

import * as React from "react";

export function ExpenseSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-surface gap-3.5 animate-pulse"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-surface-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-surface-muted rounded-md" />
                <div className="h-3 w-16 bg-surface-muted rounded-md" />
              </div>
              <div className="h-3 w-40 bg-surface-muted rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0">
            <div className="h-5 w-20 bg-surface-muted rounded-md" />
            <div className="flex items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-surface-muted" />
              <div className="w-9 h-9 rounded-xl bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
