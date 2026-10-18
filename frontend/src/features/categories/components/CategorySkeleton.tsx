import * as React from "react";

export function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-border bg-surface text-foreground space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-muted" />
              <div className="space-y-1.5">
                <div className="w-24 h-4 rounded-md bg-surface-muted" />
                <div className="w-16 h-3 rounded-md bg-surface-muted/60" />
              </div>
            </div>
            <div className="w-6 h-6 rounded-md bg-surface-muted" />
          </div>

          <div className="w-full h-8 rounded-md bg-surface-muted/40" />

          <div className="pt-2 border-t border-border-subtle space-y-2">
            <div className="flex justify-between">
              <div className="w-16 h-4 rounded-md bg-surface-muted" />
              <div className="w-20 h-4 rounded-md bg-surface-muted" />
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
