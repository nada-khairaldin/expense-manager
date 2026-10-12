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
import {
  Wallet,
  Receipt,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<"current" | "previous">("current");
  const { openAddExpense } = useAddExpense();

  const data = dashboardPeriods[selectedPeriod];

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
            متابعة دقيقة للدخل، المصروفات، وحالة الميزانية خلال {data.periodDateRange}
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
        {/* Card 1: الدخل الشهري */}
        <StatCard
          title="الدخل الشهري المعتمد"
          value={formatCurrency(data.income)}
          icon={Wallet}
          iconColorClass="text-brand-teal"
          iconBgClass="bg-brand-teal-light dark:bg-brand-teal/20"
          badge={
            <Badge variant="success" size="sm">
              دخل ثابت
            </Badge>
          }
          hint="الدخل المخصص لدورة الميزانية"
        />

        {/* Card 2: إجمالي المصروفات */}
        <StatCard
          title="إجمالي المصروفات"
          value={formatCurrency(data.totalExpenses)}
          secondaryValue={`(${data.budgetPercentageUsed}%)`}
          icon={Receipt}
          iconColorClass="text-brand-primary dark:text-foreground"
          iconBgClass="bg-brand-primary/10 dark:bg-brand-primary/30"
          progressPercentage={data.budgetPercentageUsed}
          progressColorClass={
            data.budgetPercentageUsed >= 85 ? "bg-status-warning" : "bg-brand-teal"
          }
          hint={`مجموع الإنفاق حتى تاريخ اليوم`}
          badge={
            <Badge
              variant={data.budgetPercentageUsed >= 85 ? "warning" : "neutral"}
              size="sm"
            >
              {data.budgetPercentageUsed >= 85 ? "استهلاك مرتفع" : "ضمن الخطة"}
            </Badge>
          }
        />

        {/* Card 3: المتبقي من الميزانية */}
        <StatCard
          title="المتبقي من الميزانية"
          value={formatCurrency(data.remainingBudget)}
          secondaryValue={`(${(100 - data.budgetPercentageUsed).toFixed(1)}%)`}
          icon={PiggyBank}
          iconColorClass="text-brand-gold"
          iconBgClass="bg-brand-gold-light dark:bg-brand-gold/20"
          progressPercentage={100 - data.budgetPercentageUsed}
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
          value={data.budgetStatusLevel === "excellent" ? "مستقرة وممتازة" : "مرتفعة - انتبه"}
          icon={data.budgetStatusLevel === "excellent" ? ShieldCheck : AlertTriangle}
          iconColorClass={
            data.budgetStatusLevel === "excellent"
              ? "text-brand-teal"
              : "text-status-warning"
          }
          iconBgClass={
            data.budgetStatusLevel === "excellent"
              ? "bg-brand-teal-light dark:bg-brand-teal/20"
              : "bg-status-warning-bg"
          }
          badge={
            <Badge
              variant={data.budgetStatusLevel === "excellent" ? "success" : "warning"}
              size="sm"
              dot
            >
              {data.budgetStatusLevel === "excellent" ? "ضمن الخطة" : "قريب من السقف"}
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
          <CategorySpendingList categories={data.categories} />
        </div>
      </div>

      {/* 5. Recent Expenses List */}
      <div>
        <RecentExpensesList expenses={data.recentExpenses} />
      </div>
    </div>
  );
}
