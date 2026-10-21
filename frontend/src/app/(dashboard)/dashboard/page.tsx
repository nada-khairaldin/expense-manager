"use client";

import * as React from "react";
import { dashboardPeriods } from "@/features/dashboard/mockData";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { DemoDataNotice } from "@/components/dashboard/DemoDataNotice";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategorySpendingList } from "@/components/dashboard/CategorySpendingList";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAddExpense } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/features/auth/AuthContext";
import { useCategories } from "@/features/categories/useCategories";
import { getCurrentBudgetCycleApi } from "@/features/auth/api";
import { type BudgetCycle } from "@/features/auth/types";
import { EditCycleBudgetModal } from "@/components/budget/EditCycleBudgetModal";
import {
  Wallet,
  Receipt,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  Edit3,
} from "lucide-react";

export default function DashboardPage() {
  const { token } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = React.useState<"current" | "previous">("current");
  const { openAddExpense } = useAddExpense();

  const [activeCycle, setActiveCycle] = React.useState<BudgetCycle | null>(null);
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = React.useState(false);

  const loadCycle = React.useCallback(() => {
    if (!token) return;
    getCurrentBudgetCycleApi(token)
      .then((cycle) => {
        setActiveCycle(cycle);
      })
      .catch(() => {});
  }, [token]);

  React.useEffect(() => {
    let isMounted = true;
    if (!token) return;
    getCurrentBudgetCycleApi(token)
      .then((cycle) => {
        if (isMounted) setActiveCycle(cycle);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [token]);

  const data = dashboardPeriods[selectedPeriod];

  // If in "current" period and we have active cycle from server, use its verified financial metrics
  const effectiveBudget =
    selectedPeriod === "current" && activeCycle
      ? activeCycle.budgetAmount
      : data.budgetAmount;

  const effectiveTotalExpenses =
    selectedPeriod === "current" && activeCycle && activeCycle.totalExpenses > 0
      ? activeCycle.totalExpenses
      : data.totalExpenses;

  const effectiveRemaining =
    selectedPeriod === "current" && activeCycle
      ? Math.max(0, effectiveBudget - effectiveTotalExpenses)
      : data.remainingBudget;

  const effectivePercentageUsed =
    effectiveBudget > 0
      ? Number(((effectiveTotalExpenses / effectiveBudget) * 100).toFixed(1))
      : 0;

  const { categories: realCategories } = useCategories();

  const effectiveCategories = React.useMemo(() => {
    if (selectedPeriod === "current" && token) {
      return realCategories.map((cat) => {
        const limit = cat.limit !== null && cat.limit !== undefined ? Number(cat.limit) : null;
        const spent = cat.spent !== null && cat.spent !== undefined ? Number(cat.spent) : 0;
        const percentage = limit !== null && limit > 0 ? (spent / limit) * 100 : null;
        let status: "normal" | "warning" | "exceeded" = "normal";
        if (percentage !== null) {
          if (percentage >= 100) status = "exceeded";
          else if (percentage >= 85) status = "warning";
        }
        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || "Layers",
          color: cat.color || "#16856B",
          spent,
          limit,
          percentage,
          status,
        };
      });
    }
    return data.categories;
  }, [selectedPeriod, token, realCategories, data.categories]);

  return (
    <div className="space-y-6">
      {/* 1. Demo Data Notice */}
      <DemoDataNotice />

      {/* 2. Page Header with Period Selector & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-primary dark:text-foreground">
              لوحة التحكم
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-foreground font-medium">
              {data.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            متابعة دقيقة للميزانية، المصروفات، والمتبقي خلال {data.periodDateRange}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reactive Period Selector */}
          <PeriodSelector
            currentPeriodId={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
          />
          {/* Quick Action Buttons */}
          <QuickActions onOpenAddExpense={openAddExpense} />
        </div>
      </div>

      {/* 3. Four Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: ميزانية الدورة */}
        <StatCard
          title="ميزانية دورة الميزانية"
          value={formatCurrency(effectiveBudget)}
          icon={Wallet}
          iconColorClass="text-brand-teal"
          iconBgClass="bg-brand-teal-light dark:bg-brand-teal/20"
          badge={
            selectedPeriod === "current" ? (
              <button
                type="button"
                onClick={() => setIsEditCycleModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal hover:underline py-0.5 px-2 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 transition-colors"
                title="تعديل ميزانية هذه الدورة فقط"
              >
                <Edit3 className="w-3 h-3" />
                <span>تعديل الميزانية</span>
              </button>
            ) : (
              <Badge variant="neutral" size="sm">
                دورة منتهية
              </Badge>
            )
          }
          hint={
            selectedPeriod === "current"
              ? "الميزانية المعتمدة للدورة النشطة الحالية"
              : "الميزانية المسجلة للدورة السابقة"
          }
        />

        {/* Card 2: إجمالي المصروفات */}
        <StatCard
          title="إجمالي المصروفات"
          value={formatCurrency(effectiveTotalExpenses)}
          secondaryValue={`(${effectivePercentageUsed}%)`}
          icon={Receipt}
          iconColorClass="text-brand-primary dark:text-foreground"
          iconBgClass="bg-brand-primary/10 dark:bg-brand-primary/30"
          progressPercentage={effectivePercentageUsed}
          progressColorClass={
            effectivePercentageUsed >= 85 ? "bg-status-warning" : "bg-brand-teal"
          }
          hint="مجموع الإنفاق المسجل خلال الدورة"
          badge={
            <Badge
              variant={effectivePercentageUsed >= 85 ? "warning" : "neutral"}
              size="sm"
            >
              {effectivePercentageUsed >= 85 ? "استهلاك مرتفع" : "ضمن الخطة"}
            </Badge>
          }
        />

        {/* Card 3: المتبقي من الميزانية */}
        <StatCard
          title="المتبقي من الميزانية"
          value={formatCurrency(effectiveRemaining)}
          secondaryValue={`(${(Math.max(0, 100 - effectivePercentageUsed)).toFixed(1)}%)`}
          icon={PiggyBank}
          iconColorClass="text-brand-gold"
          iconBgClass="bg-brand-gold-light dark:bg-brand-gold/20"
          progressPercentage={Math.max(0, 100 - effectivePercentageUsed)}
          progressColorClass="bg-brand-gold"
          hint="الفائض المتاح للصرف حتى نهاية الدورة"
          badge={
            <Badge variant="primary" size="sm">
              فائض متاح
            </Badge>
          }
        />

        {/* Card 4: حالة الميزانية */}
        <StatCard
          title="حالة الميزانية العامة"
          value={effectivePercentageUsed < 85 ? "مستقرة وممتازة" : "مرتفعة - انتبه"}
          icon={effectivePercentageUsed < 85 ? ShieldCheck : AlertTriangle}
          iconColorClass={
            effectivePercentageUsed < 85
              ? "text-brand-teal"
              : "text-status-warning"
          }
          iconBgClass={
            effectivePercentageUsed < 85
              ? "bg-brand-teal-light dark:bg-brand-teal/20"
              : "bg-status-warning-bg"
          }
          badge={
            <Badge
              variant={effectivePercentageUsed < 85 ? "success" : "warning"}
              size="sm"
              dot
            >
              {effectivePercentageUsed < 85 ? "ضمن الخطة" : "قريب من السقف"}
            </Badge>
          }
          hint={data.budgetNotes}
        />
      </div>

      {/* 4. Spending Distribution Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <SpendingChart
            data={data.dailySpending}
            periodLabel={data.label}
          />
        </div>
        <div className="lg:col-span-5">
          <CategorySpendingList categories={effectiveCategories} />
        </div>
      </div>

      {/* 5. Recent Expenses List */}
      <div>
        <RecentExpensesList expenses={data.recentExpenses} />
      </div>

      {/* Modal for editing current cycle's budget independently */}
      <EditCycleBudgetModal
        isOpen={isEditCycleModalOpen}
        onClose={() => setIsEditCycleModalOpen(false)}
        initialAmount={effectiveBudget}
        cycleId={activeCycle?.id}
        onSuccess={() => {
          loadCycle();
        }}
      />
    </div>
  );
}
