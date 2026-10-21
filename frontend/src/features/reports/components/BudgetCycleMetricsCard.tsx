"use client";

import React from "react";
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import type { ReportBudgetMetrics } from "../types";

interface BudgetCycleMetricsCardProps {
  metrics: ReportBudgetMetrics;
  currency?: string;
}

export function BudgetCycleMetricsCard({
  metrics,
  currency,
}: BudgetCycleMetricsCardProps) {
  const {
    budgetAmount,
    totalExpenses,
    remainingBudget,
    utilizationPercentage,
    isOverBudget,
    startDate,
    endDate,
  } = metrics;

  // Clamped percentage for progress bar width
  const progressWidth = Math.min(100, Math.max(0, utilizationPercentage));

  // Determine color theme based on utilization
  const isDanger = isOverBudget || utilizationPercentage > 100;
  const isWarning = !isDanger && utilizationPercentage > 85;

  const barColor = isDanger
    ? "bg-danger-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-brand-teal";

  return (
    <Card className="border-brand-teal/30 dark:border-brand-teal/20 bg-linear-to-b from-brand-teal/5 to-transparent">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-teal/20 text-brand-teal flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-text-primary">
                ميزانية الدورة المالية
              </CardTitle>
              <p className="text-xs text-text-secondary">
                مؤشرات الإنفاق المخصصة لهذه الدورة المحددة فقط
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isDanger ? "danger" : isWarning ? "warning" : "success"}
            size="md"
            className="gap-1.5"
          >
            {isDanger ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>تم تجاوز الميزانية بمقدار {formatCurrency(Math.abs(remainingBudget), { currencyCode: currency })}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ضمن سقف الميزانية ({utilizationPercentage}%)</span>
              </>
            )}
          </Badge>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary px-2.5 py-1 rounded-lg bg-surface-muted border border-border">
            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-secondary">
              نسبة استهلاك الميزانية:
            </span>
            <span className={`font-bold ${isDanger ? "text-danger-600 dark:text-danger-400" : isWarning ? "text-amber-600 dark:text-amber-400" : "text-brand-teal"}`}>
              {utilizationPercentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-surface-muted overflow-hidden border border-border/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl border border-border bg-surface/80 space-y-1">
            <span className="text-[11px] font-medium text-text-secondary">
              الميزانية المخصصة للدورة
            </span>
            <p className="text-base font-bold text-text-primary">
              {formatCurrency(budgetAmount, { currencyCode: currency })}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-surface/80 space-y-1">
            <span className="text-[11px] font-medium text-text-secondary">
              الإنفاق الفعلي المسجل
            </span>
            <p className="text-base font-bold text-text-primary">
              {formatCurrency(totalExpenses, { currencyCode: currency })}
            </p>
          </div>

          <div className={`p-3 rounded-xl border space-y-1 ${
            isDanger
              ? "border-danger-200 dark:border-danger-900 bg-danger-50/50 dark:bg-danger-950/20"
              : "border-border bg-surface/80"
          }`}>
            <span className="text-[11px] font-medium text-text-secondary">
              {isDanger ? "مبلغ العجز / التجاوز" : "المبلغ المتبقي للإنفاق"}
            </span>
            <p className={`text-base font-bold ${
              isDanger
                ? "text-danger-600 dark:text-danger-400"
                : "text-brand-teal"
            }`}>
              {formatCurrency(remainingBudget, { currencyCode: currency })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
