"use client";

import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PeriodSelectorProps {
  currentPeriodId: "current" | "previous";
  onSelectPeriod: (periodId: "current" | "previous") => void;
  className?: string;
}

export function PeriodSelector({
  currentPeriodId,
  onSelectPeriod,
  className,
}: PeriodSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl border border-border bg-surface text-xs shadow-sm",
        className
      )}
      role="group"
      aria-label="اختيار دورة الميزانية"
    >
      <button
        type="button"
        onClick={() => onSelectPeriod("current")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all",
          currentPeriodId === "current"
            ? "bg-brand-primary text-white shadow-sm"
            : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
        )}
        aria-pressed={currentPeriodId === "current"}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>دورة أكتوبر (الحالية)</span>
        {currentPeriodId === "current" && <Check className="w-3 h-3 ms-1" />}
      </button>

      <button
        type="button"
        onClick={() => onSelectPeriod("previous")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all",
          currentPeriodId === "previous"
            ? "bg-brand-primary text-white shadow-sm"
            : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
        )}
        aria-pressed={currentPeriodId === "previous"}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>دورة سبتمبر (السابقة)</span>
        {currentPeriodId === "previous" && <Check className="w-3 h-3 ms-1" />}
      </button>
    </div>
  );
}
