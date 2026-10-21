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
        "flex w-full sm:w-auto items-center p-1 rounded-2xl border border-border bg-surface text-xs shadow-xs",
        className
      )}
      role="group"
      aria-label="اختيار دورة الميزانية"
    >
      <button
        type="button"
        onClick={() => onSelectPeriod("current")}
        className={cn(
          "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl font-bold transition-all active:scale-95 touch-manipulation text-[11px] sm:text-xs",
          currentPeriodId === "current"
            ? "bg-brand-primary text-white shadow-xs dark:bg-brand-teal"
            : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
        )}
        aria-pressed={currentPeriodId === "current"}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">دورة أكتوبر (الحالية)</span>
        {currentPeriodId === "current" && <Check className="w-3 h-3 ms-1 shrink-0" />}
      </button>

      <button
        type="button"
        onClick={() => onSelectPeriod("previous")}
        className={cn(
          "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl font-bold transition-all active:scale-95 touch-manipulation text-[11px] sm:text-xs",
          currentPeriodId === "previous"
            ? "bg-brand-primary text-white shadow-xs dark:bg-brand-teal"
            : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
        )}
        aria-pressed={currentPeriodId === "previous"}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">دورة سبتمبر (السابقة)</span>
        {currentPeriodId === "previous" && <Check className="w-3 h-3 ms-1 shrink-0" />}
      </button>
    </div>
  );
}
