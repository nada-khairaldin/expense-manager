import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  badge?: React.ReactNode;
  hint?: string;
  progressPercentage?: number | null;
  progressColorClass?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  secondaryValue,
  icon: Icon,
  iconColorClass = "text-brand-primary dark:text-foreground",
  iconBgClass = "bg-brand-primary/10 dark:bg-brand-primary/30",
  badge,
  hint,
  progressPercentage,
  progressColorClass = "bg-brand-teal",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl border border-border bg-surface text-foreground shadow-sm transition-all hover:border-brand-teal/40",
        className
      )}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-text-secondary">
          {title}
        </span>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            iconBgClass
          )}
        >
          <Icon className={cn("w-4 h-4", iconColorClass)} aria-hidden="true" />
        </div>
      </div>

      {/* Main Value */}
      <div className="space-y-1 my-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-brand-primary dark:text-foreground">
            {value}
          </span>
          {secondaryValue && (
            <span className="text-xs text-text-muted">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>

      {/* Optional Progress Bar */}
      {typeof progressPercentage === "number" && (
        <div className="my-2.5 space-y-1">
          <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", progressColorClass)}
              style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Bottom row: Badge or Contextual Hint */}
      {(badge || hint) && (
        <div className="flex items-center justify-between gap-2 pt-2 text-xs border-t border-border-subtle/80 mt-1">
          {hint && <span className="text-text-muted text-[11px] leading-tight truncate">{hint}</span>}
          {badge && <div className="shrink-0 ms-auto">{badge}</div>}
        </div>
      )}
    </div>
  );
}
