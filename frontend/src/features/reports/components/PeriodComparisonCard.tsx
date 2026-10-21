"use client";

import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Scale,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import type { ReportComparison } from "../types";

interface PeriodComparisonCardProps {
  comparison: ReportComparison;
  currentSpending: number;
  currency?: string;
}

export function PeriodComparisonCard({
  comparison,
  currentSpending,
  currency,
}: PeriodComparisonCardProps) {
  const {
    previousPeriodLabel,
    prevStartDate,
    prevEndDate,
    previousTotalSpending,
    previousExpenseCount,
    spendingChange,
    percentageChange,
    trend,
  } = comparison;

  const isDecreased = trend === "decrease";
  const isIncreased = trend === "increase";
  const isUnchanged = trend === "no_change";

  const diffSign = spendingChange > 0 ? "+" : "";

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-teal/20 text-brand-primary dark:text-brand-teal flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-text-primary">
              مقارنة مع الفترة السابقة
            </CardTitle>
            <p className="text-xs text-text-secondary">
              مقارنة الإنفاق مع {previousPeriodLabel}
            </p>
          </div>
        </div>

        <Badge
          variant={isDecreased ? "success" : isIncreased ? "danger" : "neutral"}
          size="md"
          className="gap-1"
        >
          {isDecreased && <ArrowDownRight className="w-3.5 h-3.5 text-success-600 dark:text-success-400" />}
          {isIncreased && <ArrowUpRight className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />}
          {isUnchanged && <Minus className="w-3.5 h-3.5 text-text-secondary" />}
          <span>
            {isDecreased
              ? `انخفاض ${Math.abs(percentageChange)}%`
              : isIncreased
              ? `ارتفاع ${percentageChange}%`
              : "لا يوجد تغيير"}
          </span>
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Two Pillars: Current vs Previous */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-1">
            <span className="text-[11px] font-medium text-text-secondary">
              إنفاق الفترة الحالية
            </span>
            <p className="text-base font-bold text-text-primary">
              {formatCurrency(currentSpending, { currencyCode: currency })}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-1">
            <span className="text-[11px] font-medium text-text-secondary">
              إنفاق {previousPeriodLabel}
            </span>
            <p className="text-base font-bold text-text-secondary">
              {formatCurrency(previousTotalSpending, { currencyCode: currency })}
            </p>
          </div>
        </div>

        {/* Change explanation */}
        <div className={`p-3 rounded-xl border text-xs space-y-1 ${
          isDecreased
            ? "border-success-200 dark:border-success-900 bg-success-50/50 dark:bg-success-950/20 text-success-800 dark:text-success-300"
            : isIncreased
            ? "border-danger-200 dark:border-danger-900 bg-danger-50/50 dark:bg-danger-950/20 text-danger-800 dark:text-danger-300"
            : "border-border bg-surface-muted/60 text-text-secondary"
        }`}>
          <div className="font-semibold flex items-center gap-1.5">
            {isDecreased ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>وفرت {formatCurrency(Math.abs(spendingChange), { currencyCode: currency })} مقارنة بالفترة السابقة!</span>
              </>
            ) : isIncreased ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>زيادة في الإنفاق بمقدار {formatCurrency(spendingChange, { currencyCode: currency })}</span>
              </>
            ) : (
              <span>معدل الإنفاق مطابق تماماً للفترة السابقة</span>
            )}
          </div>
          <p className="text-[11px] opacity-90">
            فترة المقارنة: {formatDate(prevStartDate)} إلى {formatDate(prevEndDate)} ({previousExpenseCount} معاملة)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
