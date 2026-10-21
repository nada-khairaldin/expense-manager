"use client";

import * as React from "react";
import Link from "next/link";
import { useDashboard } from "@/features/dashboard/useDashboard";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategorySpendingList } from "@/components/dashboard/CategorySpendingList";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAddExpense } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EditCycleBudgetModal } from "@/components/budget/EditCycleBudgetModal";
import {
  Wallet,
  Receipt,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Edit3,
  RefreshCw,
  Sparkles,
  PlusCircle,
  FolderTree,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<"current" | "previous">("current");
  const { openAddExpense } = useAddExpense();
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = React.useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidateDashboard,
  } = useDashboard(selectedPeriod);

  // 1. Loading Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="جاري تحميل لوحة التحكم">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-surface-muted rounded-xl" />
            <div className="h-4 w-72 bg-surface-muted rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-44 bg-surface-muted rounded-2xl" />
            <div className="h-11 w-36 bg-surface-muted rounded-xl" />
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-border bg-surface p-5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-surface-muted rounded" />
                <div className="h-8 w-8 bg-surface-muted rounded-xl" />
              </div>
              <div className="h-7 w-32 bg-surface-muted rounded" />
              <div className="h-2 w-full bg-surface-muted rounded-full" />
            </div>
          ))}
        </div>

        {/* Chart & Categories Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 h-80 rounded-2xl border border-border bg-surface p-6" />
          <div className="lg:col-span-5 h-80 rounded-2xl border border-border bg-surface p-6" />
        </div>

        {/* Recent Expenses Skeleton */}
        <div className="h-64 rounded-2xl border border-border bg-surface p-6" />
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div
        role="alert"
        className="p-8 rounded-3xl border border-status-danger/30 bg-status-danger-bg text-center space-y-4 max-w-xl mx-auto my-12"
      >
        <div className="w-12 h-12 rounded-2xl bg-status-danger/10 text-status-danger flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-status-danger">
            تعذر تحميل بيانات لوحة التحكم
          </h2>
          <p className="text-xs text-text-secondary">
            {error?.message || "حدث خطأ غير متوقع أثناء جلب البيانات من الخادم."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-status-danger text-white text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all touch-manipulation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  const currency = data?.currency || "ILS";
  const budget = data?.budget;
  const isSetupNeeded = Boolean(data?.isSetupNeeded || !budget);

  return (
    <div className="space-y-6">
      {/* 3. Onboarding / Setup Card if budget is not configured */}
      {isSetupNeeded && (
        <div className="relative overflow-hidden p-6 rounded-3xl border border-brand-teal/30 bg-gradient-to-r from-brand-teal/10 via-brand-teal/5 to-transparent shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-teal shrink-0" />
                <h3 className="text-base font-bold text-brand-primary dark:text-foreground">
                  مرحباً بك في مصروفي! ابدأ بتحديد ميزانيتك
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                لم يتم إعداد ميزانية دورية لحسابك بعد. حدد ميزانيتك الشهرية وتاريخ تجديد الدورة لتفعيل التحليلات المالية الدقيقة والتنبيهات الذكية.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditCycleModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all active:scale-95 touch-manipulation min-h-[44px]"
              >
                <Wallet className="w-4 h-4" />
                <span>تعيين الميزانية الآن</span>
              </button>
              <button
                type="button"
                onClick={openAddExpense}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-semibold hover:bg-surface-muted transition-all active:scale-95 touch-manipulation min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 text-brand-teal" />
                <span>إضافة أول مصروف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Threshold Warning Banner (Centralized thresholds) */}
      {budget && budget.status === "exceeded" && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-status-danger-bg border border-status-danger/40 text-status-danger shadow-xs animate-in fade-in duration-300"
        >
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-sm">
              تنبيه هام: لقد تجاوزت الميزانية المحددة بنسبة {budget.consumptionPercentage.toFixed(1)}%!
            </p>
            <p className="leading-relaxed opacity-90">
              {budget.warningMessage ||
                `تم تجاوز سقف الميزانية بمقدار ${formatCurrency(Math.abs(budget.remainingBudget), { currencyCode: currency })}. يرجى مراجعة المصروفات لضبط النفقات.`}
            </p>
          </div>
        </div>
      )}

      {budget && budget.status === "critical" && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-status-danger-bg/80 border border-status-danger/40 text-status-danger shadow-xs animate-in fade-in duration-300"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-sm">
              تحذير حرج: استهلاك الميزانية وصل إلى {budget.consumptionPercentage.toFixed(1)}%!
            </p>
            <p className="leading-relaxed opacity-90">
              {budget.warningMessage ||
                `المتبقي من الميزانية قليل جداً (${formatCurrency(budget.remainingBudget, { currencyCode: currency })}). يوصى بترشيد الصرف حتى نهاية الدورة.`}
            </p>
          </div>
        </div>
      )}

      {budget && budget.status === "approaching_limit" && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-status-warning-bg border border-status-warning/40 text-status-warning shadow-xs animate-in fade-in duration-300"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-sm">
              تنبيه اقتراب من الحد: استهلاك الميزانية بلغ {budget.consumptionPercentage.toFixed(1)}%
            </p>
            <p className="leading-relaxed opacity-90">
              {budget.warningMessage ||
                `لقد قاربت على استنفاذ ميزانية هذه الدورة. المتبقي متاح: ${formatCurrency(budget.remainingBudget, { currencyCode: currency })}.`}
            </p>
          </div>
        </div>
      )}

      {/* 5. Page Header with Period Selector & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-primary dark:text-foreground">
              لوحة التحكم
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-foreground font-medium">
              {data?.periodLabel || "الدورة الحالية"}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            متابعة دقيقة للميزانية، المصروفات، والمتبقي خلال {data?.periodDateRange || "الفترة المحددة"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Period Selector */}
          <PeriodSelector
            currentPeriodId={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            currentLabel={data?.availableCycles?.current?.label || "الدورة الحالية"}
            previousLabel={data?.availableCycles?.previous?.label || "الدورة السابقة"}
            hasPrevious={Boolean(data?.availableCycles?.previous)}
          />

          {/* Quick Action Buttons */}
          <QuickActions onOpenAddExpense={openAddExpense} />
        </div>
      </div>

      {/* 6. Four Authoritative Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: ميزانية الدورة */}
        <StatCard
          title="ميزانية الدورة"
          value={formatCurrency(budget?.budgetAmount || 0, { currencyCode: currency })}
          icon={Wallet}
          iconColorClass="text-brand-teal"
          iconBgClass="bg-brand-teal-light dark:bg-brand-teal/20"
          badge={
            selectedPeriod === "current" ? (
              <button
                type="button"
                onClick={() => setIsEditCycleModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal hover:underline py-1 px-2.5 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 transition-colors touch-manipulation"
                title="تعديل ميزانية هذه الدورة فقط"
              >
                <Edit3 className="w-3 h-3" />
                <span>تعديل الميزانية</span>
              </button>
            ) : (
              <Badge variant="neutral" size="sm">
                دورة سابقة
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
          value={formatCurrency(budget?.totalExpenses || 0, { currencyCode: currency })}
          secondaryValue={`(${budget ? budget.consumptionPercentage.toFixed(1) : "0.0"}%)`}
          icon={Receipt}
          iconColorClass="text-brand-primary dark:text-foreground"
          iconBgClass="bg-brand-primary/10 dark:bg-brand-primary/30"
          progressPercentage={budget ? budget.consumptionPercentage : 0}
          progressColorClass={
            budget?.status === "exceeded" || budget?.status === "critical"
              ? "bg-status-danger"
              : budget?.status === "approaching_limit"
              ? "bg-status-warning"
              : "bg-brand-teal"
          }
          hint="مجموع الإنفاق المسجل خلال الدورة"
          badge={
            <Badge
              variant={
                budget?.status === "exceeded" || budget?.status === "critical"
                  ? "danger"
                  : budget?.status === "approaching_limit"
                  ? "warning"
                  : "success"
              }
              size="sm"
            >
              {budget?.status === "exceeded"
                ? "تجاوز الميزانية"
                : budget?.status === "critical"
                ? "مستوى حرج (95%+)"
                : budget?.status === "approaching_limit"
                ? "استهلاك مرتفع (85%+)"
                : "ضمن الخطة"}
            </Badge>
          }
        />

        {/* Card 3: المتبقي من الميزانية (يدعم الأرقام السالبة عند التجاوز) */}
        {(() => {
          const remaining = budget?.remainingBudget ?? 0;
          const isNegative = remaining < 0;
          const remainingPercentage =
            budget && budget.budgetAmount > 0
              ? Number(((remaining / budget.budgetAmount) * 100).toFixed(1))
              : 0;

          return (
            <StatCard
              title={isNegative ? "عجز الميزانية" : "المتبقي من الميزانية"}
              value={formatCurrency(remaining, { currencyCode: currency })}
              secondaryValue={`(${remainingPercentage}%)`}
              icon={PiggyBank}
              iconColorClass={isNegative ? "text-status-danger" : "text-brand-gold"}
              iconBgClass={
                isNegative
                  ? "bg-status-danger-bg"
                  : "bg-brand-gold-light dark:bg-brand-gold/20"
              }
              progressPercentage={isNegative ? 0 : Math.max(0, remainingPercentage)}
              progressColorClass="bg-brand-gold"
              hint={
                isNegative
                  ? `تجاوز بالسالب بمقدار ${formatCurrency(Math.abs(remaining), { currencyCode: currency })}`
                  : "الفائض المتاح للصرف حتى نهاية الدورة"
              }
              badge={
                <Badge variant={isNegative ? "danger" : "primary"} size="sm">
                  {isNegative ? "عجز في الميزانية" : "فائض متاح"}
                </Badge>
              }
            />
          );
        })()}

        {/* Card 4: حالة الميزانية العامة */}
        {(() => {
          const status = budget?.status ?? "no_limit";
          const isNormal = status === "within_limit";
          const isWarning = status === "approaching_limit";
          const isDanger = status === "critical" || status === "exceeded";

          return (
            <StatCard
              title="حالة الميزانية العامة"
              value={
                status === "within_limit"
                  ? "مستقرة وممتازة"
                  : status === "approaching_limit"
                  ? "اقتراب من السقف"
                  : status === "critical"
                  ? "مستوى حرج جداً"
                  : status === "exceeded"
                  ? "تجاوزت الميزانية"
                  : "بدون سقف محدد"
              }
              icon={isNormal ? ShieldCheck : isWarning ? AlertTriangle : AlertOctagon}
              iconColorClass={
                isNormal
                  ? "text-brand-teal"
                  : isWarning
                  ? "text-status-warning"
                  : isDanger
                  ? "text-status-danger"
                  : "text-text-muted"
              }
              iconBgClass={
                isNormal
                  ? "bg-brand-teal-light dark:bg-brand-teal/20"
                  : isWarning
                  ? "bg-status-warning-bg"
                  : isDanger
                  ? "bg-status-danger-bg"
                  : "bg-surface-muted"
              }
              badge={
                <Badge
                  variant={
                    isNormal ? "success" : isWarning ? "warning" : isDanger ? "danger" : "neutral"
                  }
                  size="sm"
                  dot
                >
                  {isNormal
                    ? "ضمن الخطة"
                    : isWarning
                    ? "قريب من السقف"
                    : isDanger
                    ? "تنبيه نشط"
                    : "غير محدد"}
                </Badge>
              }
              hint={budget?.warningMessage || "معدل الاستهلاك الحالي يتناسب مع أيام الدورة"}
            />
          );
        })()}
      </div>

      {/* 7. Spending Distribution Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <SpendingChart
            data={data?.dailySpending || []}
            periodLabel={data?.periodLabel || "الدورة الحالية"}
            currency={currency}
          />
        </div>
        <div className="lg:col-span-5">
          <CategorySpendingList
            categories={data?.categories || []}
            currency={currency}
          />
        </div>
      </div>

      {/* 8. Recent Expenses List */}
      <div>
        <RecentExpensesList
          expenses={data?.recentExpenses || []}
          currency={currency}
        />
      </div>

      {/* Modal for editing current cycle's budget independently */}
      <EditCycleBudgetModal
        isOpen={isEditCycleModalOpen}
        onClose={() => setIsEditCycleModalOpen(false)}
        initialAmount={budget?.budgetAmount || 5000}
        cycleId={data?.availableCycles?.[selectedPeriod]?.id}
        onSuccess={() => {
          invalidateDashboard();
          refetch();
        }}
      />
    </div>
  );
}
