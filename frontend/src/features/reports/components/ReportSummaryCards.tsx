"use client";

import React from "react";
import { TrendingDown, Receipt, Calculator, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import type { ReportSummary, ReportComparison } from "../types";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  comparison?: ReportComparison;
  currency?: string;
  isLoading?: boolean;
}

export function ReportSummaryCards({
  summary,
  comparison,
  currency,
  isLoading,
}: ReportSummaryCardsProps) {
  // Determine trend text & variant for comparison badge
  let trendBadge: React.ReactNode = null;

  if (comparison) {
    const isDecreased = comparison.trend === "decrease";
    const isIncreased = comparison.trend === "increase";
    const prefix = comparison.spendingChange > 0 ? "+" : "";

    trendBadge = (
      <Badge
        variant={isDecreased ? "success" : isIncreased ? "danger" : "neutral"}
        size="sm"
        className="text-[10px] py-0 px-1.5"
      >
        {prefix}{comparison.percentageChange}% مقارنة بـ {comparison.previousPeriodLabel}
      </Badge>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spending */}
      <StatCard
        title="إجمالي الإنفاق"
        value={formatCurrency(summary.totalSpending, { currencyCode: currency })}
        icon={TrendingDown}
        badge={trendBadge}
        className="border-brand-primary/20 dark:border-brand-teal/20"
      />

      {/* Transaction Count */}
      <StatCard
        title="عدد المعاملات"
        value={summary.expenseCount.toLocaleString("ar-PS")}
        hint={
          comparison
            ? `${comparison.previousExpenseCount} معاملة في ${comparison.previousPeriodLabel}`
            : undefined
        }
        icon={Receipt}
      />

      {/* Average Transaction */}
      <StatCard
        title="متوسط المعاملة"
        value={formatCurrency(summary.averageExpense, { currencyCode: currency })}
        hint="إجمالي الإنفاق مقسوماً على عدد المعاملات"
        icon={Calculator}
      />

      {/* Highest Expense */}
      <StatCard
        title="أعلى معاملة مسجلة"
        value={formatCurrency(summary.maxExpense, { currencyCode: currency })}
        hint={
          summary.minExpense > 0
            ? `أدنى نفقة: ${formatCurrency(summary.minExpense, { currencyCode: currency })}`
            : "ضمن الفترة المحددة"
        }
        icon={ArrowUpRight}
      />
    </div>
  );
}
