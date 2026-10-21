"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, Layers } from "lucide-react";
import { useFinancialReport, useReportBudgetCycles } from "@/features/reports/useReports";
import type { ReportPeriod, ReportQueryParams } from "@/features/reports/types";
import { ReportHeader } from "@/features/reports/components/ReportHeader";
import { ReportPeriodSelector } from "@/features/reports/components/ReportPeriodSelector";
import { ReportSummaryCards } from "@/features/reports/components/ReportSummaryCards";
import { BudgetCycleMetricsCard } from "@/features/reports/components/BudgetCycleMetricsCard";
import { PeriodComparisonCard } from "@/features/reports/components/PeriodComparisonCard";
import { CategoryBreakdownChart } from "@/features/reports/components/CategoryBreakdownChart";
import { SpendingOverTimeChart } from "@/features/reports/components/SpendingOverTimeChart";
import { ReportFiltersToolbar } from "@/features/reports/components/ReportFiltersToolbar";
import { ReportExpensesList } from "@/features/reports/components/ReportExpensesList";
import { Card, CardContent } from "@/components/ui/Card";

export default function ReportsPage() {
  const [params, setParams] = useState<ReportQueryParams>({
    period: "current_cycle",
    sortBy: "date",
    order: "desc",
  });

  const {
    data: report,
    isLoading: isReportLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFinancialReport(params);

  const {
    data: cyclesData,
    isLoading: isCyclesLoading,
  } = useReportBudgetCycles();

  // Period change handler
  const handleSelectPeriod = (period: ReportPeriod, cycleId?: string) => {
    setParams((prev) => ({
      ...prev,
      period,
      cycleId: period === "cycle" ? cycleId : undefined,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  // Custom range handler
  const handleSelectCustomRange = (startDate: string, endDate: string) => {
    setParams((prev) => ({
      ...prev,
      period: "custom",
      cycleId: undefined,
      startDate,
      endDate,
    }));
  };

  // Filter change handler
  const handleFilterChange = (updated: Partial<ReportQueryParams>) => {
    setParams((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Clear filters handler (retaining current period)
  const handleClearFilters = () => {
    setParams((prev) => ({
      period: prev.period,
      cycleId: prev.cycleId,
      startDate: prev.startDate,
      endDate: prev.endDate,
      sortBy: "date",
      order: "desc",
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <ReportHeader
        periodLabel={report?.periodLabel ?? "التقارير المالية"}
        startDate={report?.startDate}
        endDate={report?.endDate}
        currency={report?.currency}
        isLoading={isFetching}
        onRefresh={() => refetch()}
      />

      {/* Period Selector Tabs */}
      <ReportPeriodSelector
        currentPeriod={params.period ?? "current_cycle"}
        selectedCycleId={params.cycleId}
        startDate={params.startDate}
        endDate={params.endDate}
        currency={report?.currency}
        budgetCycles={cyclesData?.cycles ?? []}
        isLoadingCycles={isCyclesLoading}
        onSelectPeriod={handleSelectPeriod}
        onSelectCustomRange={handleSelectCustomRange}
      />

      {/* Filters Toolbar */}
      <ReportFiltersToolbar
        categoryId={params.categoryId}
        minAmount={params.minAmount}
        maxAmount={params.maxAmount}
        sortBy={params.sortBy}
        order={params.order}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error State */}
      {isError && (
        <Card className="border-danger-200 dark:border-danger-800 bg-danger-50/50 dark:bg-danger-950/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-danger-700 dark:text-danger-300">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">تعذر تحميل بيانات التقرير</h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {error?.message || "حدث خطأ غير متوقع أثناء الاتصال بالخادم."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-danger-600 text-white text-xs font-semibold hover:bg-danger-700 transition-colors min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {isReportLoading && !report && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-muted/60 border border-border" />
            ))}
          </div>
          <div className="h-44 rounded-2xl bg-surface-muted/60 border border-border" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-surface-muted/60 border border-border" />
            <div className="h-80 rounded-2xl bg-surface-muted/60 border border-border" />
          </div>
        </div>
      )}

      {/* Loaded Report Content */}
      {report && (
        <div className={`space-y-6 transition-opacity duration-200 ${isFetching ? "opacity-75" : "opacity-100"}`}>
          {/* Summary Metric Cards */}
          <ReportSummaryCards
            summary={report.summary}
            comparison={report.comparison}
            currency={report.currency}
            isLoading={isFetching}
          />

          {/* Budget Cycle Metrics (Conditional: displayed ONLY when period is a budget cycle) */}
          {report.budgetMetrics && (
            <BudgetCycleMetricsCard
              metrics={report.budgetMetrics}
              currency={report.currency}
            />
          )}

          {/* Visualizations Grid: Category Breakdown & Spending Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Category Breakdown (Donut Chart & List) */}
            <CategoryBreakdownChart
              categories={report.categoryBreakdown}
              totalSpending={report.summary.totalSpending}
              currency={report.currency}
            />

            {/* Spending Over Time (Trajectory Chart) */}
            <SpendingOverTimeChart
              data={report.timeSeries.data}
              interval={report.timeSeries.interval}
              currency={report.currency}
            />
          </div>

          {/* Period Comparison & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PeriodComparisonCard
                comparison={report.comparison}
                currentSpending={report.summary.totalSpending}
                currency={report.currency}
              />
            </div>

            <div className="lg:col-span-2">
              <ReportExpensesList
                expenses={report.expenses}
                currency={report.currency}
                totalCount={report.summary.expenseCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
