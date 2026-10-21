"use client";

import React from "react";
import { BarChart3, RefreshCw, Calendar, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters/formatDate";
import { getCurrencyConfig, defaultCurrency, type CurrencyConfig } from "@/config/currency";

function resolveCurrencyConfig(currency?: string): CurrencyConfig {
  try {
    if (typeof getCurrencyConfig === "function") {
      return getCurrencyConfig(currency);
    }
  } catch {
    // fallback
  }
  return defaultCurrency;
}

interface ReportHeaderProps {
  periodLabel: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
  isLoading?: boolean;
  onRefresh: () => void;
}

export function ReportHeader({
  periodLabel,
  startDate,
  endDate,
  currency,
  isLoading,
  onRefresh,
}: ReportHeaderProps) {
  const currencyCfg = resolveCurrencyConfig(currency);

  const formattedDateRange =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-teal/20 text-brand-primary dark:text-brand-teal flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              التقارير المالية والتحليلات
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              تحليل تفصيلي للنفقات والأنماط المالية بناءً على البيانات الفعلية
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {formattedDateRange && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted/60 border border-border text-xs text-text-secondary">
            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
            <span className="font-medium text-text-primary">{formattedDateRange}</span>
          </div>
        )}

        <Badge variant="neutral" size="md" className="gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-brand-primary dark:text-brand-teal" />
          <span>العملة: {currencyCfg.nameAr} ({currencyCfg.symbol})</span>
        </Badge>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 min-h-[36px]"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-teal" : ""}`} />
          <span>تحديث</span>
        </button>
      </div>
    </div>
  );
}
