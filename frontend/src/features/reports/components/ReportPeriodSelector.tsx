"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Clock,
  History,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { ReportPeriod, ReportBudgetCycle } from "../types";
import { CustomDateRangeModal } from "./CustomDateRangeModal";
import { formatDate } from "@/lib/formatters/formatDate";
import { formatCurrency } from "@/lib/formatters/formatCurrency";

interface ReportPeriodSelectorProps {
  currentPeriod: ReportPeriod;
  selectedCycleId?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
  budgetCycles?: ReportBudgetCycle[];
  isLoadingCycles?: boolean;
  onSelectPeriod: (period: ReportPeriod, cycleId?: string) => void;
  onSelectCustomRange: (startDate: string, endDate: string) => void;
}

export function ReportPeriodSelector({
  currentPeriod,
  selectedCycleId,
  startDate,
  endDate,
  currency,
  budgetCycles = [],
  isLoadingCycles,
  onSelectPeriod,
  onSelectCustomRange,
}: ReportPeriodSelectorProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCyclesDropdownOpen, setIsCyclesDropdownOpen] = useState(false);

  // Find currently selected historical cycle
  const selectedHistoricalCycle = budgetCycles.find((c) => c.id === selectedCycleId);

  const periods: Array<{
    id: ReportPeriod;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hint?: string;
  }> = [
    { id: "today", label: "اليوم", icon: Clock },
    { id: "this_week", label: "هذا الأسبوع", icon: CalendarDays },
    { id: "this_month", label: "هذا الشهر التقويمي", icon: CalendarRange, hint: "1 إلى نهاية الشهر" },
    { id: "current_cycle", label: "دورة الميزانية الحالية", icon: Sparkles, hint: "حسب يوم التجديد" },
  ];

  return (
    <div className="space-y-3">
      {/* Mobile-first scrollable or wrapped period buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {periods.map((p) => {
          const Icon = p.icon;
          const isActive = currentPeriod === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPeriod(p.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] shrink-0 border ${
                isActive
                  ? "bg-brand-primary dark:bg-brand-teal text-white dark:text-brand-dark border-transparent shadow-xs"
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}

        {/* Previous Budget Cycles Selector Button & Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsCyclesDropdownOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] border ${
              currentPeriod === "cycle"
                ? "bg-brand-primary dark:bg-brand-teal text-white dark:text-brand-dark border-transparent shadow-xs"
                : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>
              {currentPeriod === "cycle" && selectedHistoricalCycle
                ? `دورة: ${formatDate(selectedHistoricalCycle.startDate, { month: "short", year: "numeric" })}`
                : "دورات سابقة"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCyclesDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isCyclesDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsCyclesDropdownOpen(false)}
              />
              <div className="absolute top-full mt-1.5 start-0 z-30 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-text-secondary border-b border-border/60">
                  اختر دورة ميزانية سابقة:
                </div>

                {isLoadingCycles ? (
                  <div className="p-4 text-center text-xs text-text-secondary">
                    جاري تحميل الدورات...
                  </div>
                ) : budgetCycles.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-secondary">
                    لا توجد دورات ميزانية سابقة مسجلة
                  </div>
                ) : (
                  budgetCycles.map((cycle) => {
                    const isCycleSelected =
                      currentPeriod === "cycle" && selectedCycleId === cycle.id;

                    return (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => {
                          onSelectPeriod("cycle", cycle.id);
                          setIsCyclesDropdownOpen(false);
                        }}
                        className={`w-full text-start p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          isCycleSelected
                            ? "bg-brand-teal/15 text-brand-teal font-semibold"
                            : "hover:bg-surface-muted text-text-primary"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-medium text-text-primary">
                            {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                          </div>
                          <div className="text-[11px] text-text-secondary">
                            الميزانية: {formatCurrency(cycle.budgetAmount, { currencyCode: currency })}
                            {cycle.isCurrent && " (الدورة الحالية)"}
                          </div>
                        </div>
                        {isCycleSelected && <Check className="w-4 h-4 text-brand-teal shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Custom Date Range Button */}
        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] shrink-0 border ${
            currentPeriod === "custom"
              ? "bg-brand-primary dark:bg-brand-teal text-white dark:text-brand-dark border-transparent shadow-xs"
              : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted"
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>
            {currentPeriod === "custom" && startDate && endDate
              ? `مخصص (${startDate.slice(5)} إلى ${endDate.slice(5)})`
              : "نطاق مخصص..."}
          </span>
        </button>
      </div>

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        currentStartDate={startDate}
        currentEndDate={endDate}
        onApply={(s, e) => {
          onSelectCustomRange(s, e);
        }}
      />
    </div>
  );
}
