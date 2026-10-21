import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import {
  toUTCDateOnly,
  calculateCycleDateRange,
  resolveBudgetCycle,
} from "./budget-cycle.service.js";
import type { ReportQueryInput, ReportPeriod } from "../schemas/report.schema.js";
import type { BudgetCycle, Prisma } from "../../generated/prisma/client.js";

export interface PeriodDateResolution {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  periodLabel: string;
  prevPeriodLabel: string;
  period: ReportPeriod;
  cycle: BudgetCycle | null;
}

/**
 * Resolves the exact date boundaries and comparison boundaries for a given report period.
 */
export async function resolveReportPeriodDates(
  userId: string,
  input: ReportQueryInput,
): Promise<PeriodDateResolution> {
  const now = new Date();
  const today = toUTCDateOnly(now);

  switch (input.period) {
    case "today": {
      const startDate = today;
      const endDate = today;
      const prevStartDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const prevEndDate = prevStartDate;

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "اليوم",
        prevPeriodLabel: "أمس",
        period: "today",
        cycle: null,
      };
    }

    case "this_week": {
      // Week begins on Saturday (Middle Eastern standard, 0=Sun, 1=Mon, ..., 6=Sat)
      const day = today.getUTCDay();
      const daysSinceSaturday = (day + 1) % 7;
      const startDate = new Date(today.getTime() - daysSinceSaturday * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      const prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevEndDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "هذا الأسبوع",
        prevPeriodLabel: "الأسبوع الماضي",
        period: "this_week",
        cycle: null,
      };
    }

    case "this_month": {
      // Calendar month: from 1st of current month to last day of current month
      const y = today.getUTCFullYear();
      const m = today.getUTCMonth();
      const startDate = new Date(Date.UTC(y, m, 1));
      const endDate = new Date(Date.UTC(y, m + 1, 0));

      const prevY = m === 0 ? y - 1 : y;
      const prevM = m === 0 ? 11 : m - 1;
      const prevStartDate = new Date(Date.UTC(prevY, prevM, 1));
      const prevEndDate = new Date(Date.UTC(prevY, prevM + 1, 0));

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "هذا الشهر التقويمي",
        prevPeriodLabel: "الشهر التقويمي السابق",
        period: "this_month",
        cycle: null,
      };
    }

    case "current_cycle": {
      let activeCycle = await prisma.budgetCycle.findFirst({
        where: {
          userId,
          startDate: { lte: today },
          endDate: { gte: today },
        },
        orderBy: { startDate: "desc" },
      });

      if (!activeCycle) {
        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (settings && settings.budgetSetupCompleted && settings.defaultBudgetAmount !== null) {
          activeCycle = await resolveBudgetCycle(userId, today);
        } else {
          // If no setup, check for the latest existing cycle
          const latestCycle = await prisma.budgetCycle.findFirst({
            where: { userId },
            orderBy: { startDate: "desc" },
          });
          if (latestCycle) {
            activeCycle = latestCycle;
          } else {
            throw new AppError(
              400,
              "لم يتم العثور على دورة ميزانية نشطة. يرجى إعداد الميزانية أولاً لتفعيل تقارير الدورات.",
            );
          }
        }
      }

      const startDate = activeCycle.startDate;
      const endDate = activeCycle.endDate;

      // Find the immediately preceding historical budget cycle in database
      const prevCycle = await prisma.budgetCycle.findFirst({
        where: {
          userId,
          endDate: { lt: startDate },
        },
        orderBy: { endDate: "desc" },
      });

      let prevStartDate: Date;
      let prevEndDate: Date;

      if (prevCycle) {
        prevStartDate = prevCycle.startDate;
        prevEndDate = prevCycle.endDate;
      } else {
        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        const renewalDay = settings?.budgetRenewalDay ?? 1;
        const dayBeforeStart = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        const calcPrev = calculateCycleDateRange(dayBeforeStart, renewalDay);
        prevStartDate = calcPrev.startDate;
        prevEndDate = calcPrev.endDate;
      }

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "دورة الميزانية الحالية",
        prevPeriodLabel: "دورة الميزانية السابقة",
        period: "current_cycle",
        cycle: activeCycle,
      };
    }

    case "cycle": {
      if (!input.cycleId) {
        throw new AppError(400, "يجب تحديد معرف دورة الميزانية (cycleId)");
      }

      const cycle = await prisma.budgetCycle.findFirst({
        where: {
          id: input.cycleId,
          userId,
        },
      });

      if (!cycle) {
        throw new AppError(404, "دورة الميزانية المطلوبة غير موجودة أو لا تنتمي لحسابك");
      }

      const startDate = cycle.startDate;
      const endDate = cycle.endDate;

      // Find preceding cycle
      const prevCycle = await prisma.budgetCycle.findFirst({
        where: {
          userId,
          endDate: { lt: startDate },
        },
        orderBy: { endDate: "desc" },
      });

      let prevStartDate: Date;
      let prevEndDate: Date;

      if (prevCycle) {
        prevStartDate = prevCycle.startDate;
        prevEndDate = prevCycle.endDate;
      } else {
        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        const renewalDay = settings?.budgetRenewalDay ?? 1;
        const dayBeforeStart = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        const calcPrev = calculateCycleDateRange(dayBeforeStart, renewalDay);
        prevStartDate = calcPrev.startDate;
        prevEndDate = calcPrev.endDate;
      }

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "دورة ميزانية سابقة",
        prevPeriodLabel: "الدورة السابقة لها",
        period: "cycle",
        cycle,
      };
    }

    case "custom": {
      if (!input.startDate || !input.endDate) {
        throw new AppError(400, "يجب تحديد تاريخ البداية والنهاية للفترة المخصصة");
      }

      const startDate = toUTCDateOnly(input.startDate);
      const endDate = toUTCDateOnly(input.endDate);

      if (startDate.getTime() > endDate.getTime()) {
        throw new AppError(400, "تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية");
      }

      const durationMs = endDate.getTime() - startDate.getTime() + 24 * 60 * 60 * 1000;
      const prevEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      const prevStartDate = new Date(prevEndDate.getTime() - durationMs + 24 * 60 * 60 * 1000);

      return {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        periodLabel: "فترة مخصصة",
        prevPeriodLabel: "الفترة السابقة المماثلة",
        period: "custom",
        cycle: null,
      };
    }

    default:
      throw new AppError(400, "نوع الفترة المحددة غير مدعوم");
  }
}

/**
 * Builds standard Prisma expense where input adhering to reporting filters.
 */
function buildExpenseWhere(
  userId: string,
  startDate: Date,
  endDate: Date,
  filters: {
    categoryId?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
  },
): Prisma.ExpenseWhereInput {
  let categoryCondition: Prisma.ExpenseWhereInput = {};
  if (filters.categoryId === "none" || filters.categoryId === "uncategorized") {
    categoryCondition = { categoryId: null };
  } else if (filters.categoryId) {
    categoryCondition = { categoryId: filters.categoryId };
  }

  return {
    userId,
    expenseDate: {
      gte: startDate,
      lte: endDate,
    },
    ...categoryCondition,
    ...(filters.minAmount !== undefined || filters.maxAmount !== undefined
      ? {
          amount: {
            ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
            ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
          },
        }
      : {}),
  };
}

/**
 * Generates the complete financial report.
 */
export async function generateFinancialReport(
  userId: string,
  input: ReportQueryInput,
) {
  // 1. Resolve date boundaries and comparison period
  const periodInfo = await resolveReportPeriodDates(userId, input);
  const { startDate, endDate, prevStartDate, prevEndDate, cycle } = periodInfo;

  // 2. Fetch User Settings (currency, renewal day)
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  const currency = settings?.currency ?? "ILS";

  // 3. Build Prisma filters
  const currentWhere = buildExpenseWhere(userId, startDate, endDate, {
    categoryId: input.categoryId,
    minAmount: input.minAmount,
    maxAmount: input.maxAmount,
  });

  const prevWhere = buildExpenseWhere(userId, prevStartDate, prevEndDate, {
    categoryId: input.categoryId,
    minAmount: input.minAmount,
    maxAmount: input.maxAmount,
  });

  // 4. Core database aggregation for the current period
  const [currentAgg, currentCount] = await Promise.all([
    prisma.expense.aggregate({
      where: currentWhere,
      _sum: { amount: true },
      _avg: { amount: true },
      _min: { amount: true },
      _max: { amount: true },
    }),
    prisma.expense.count({ where: currentWhere }),
  ]);

  const totalSpending = currentAgg._sum.amount
    ? Math.round(Number(currentAgg._sum.amount) * 100) / 100
    : 0;
  const expenseCount = currentCount;
  const averageExpense =
    expenseCount > 0 ? Math.round((totalSpending / expenseCount) * 100) / 100 : 0;
  const minExpense = currentAgg._min.amount ? Number(currentAgg._min.amount) : 0;
  const maxExpense = currentAgg._max.amount ? Number(currentAgg._max.amount) : 0;

  // 5. Aggregation for previous period comparison
  const [prevAgg, prevCount] = await Promise.all([
    prisma.expense.aggregate({
      where: prevWhere,
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: prevWhere }),
  ]);

  const previousTotalSpending = prevAgg._sum.amount
    ? Math.round(Number(prevAgg._sum.amount) * 100) / 100
    : 0;
  const previousExpenseCount = prevCount;

  const spendingChange = Math.round((totalSpending - previousTotalSpending) * 100) / 100;
  let percentageChange: number;
  if (previousTotalSpending === 0) {
    percentageChange = totalSpending > 0 ? 100 : 0;
  } else {
    percentageChange =
      Math.round(((totalSpending - previousTotalSpending) / previousTotalSpending) * 1000) / 10;
  }

  const trend: "increase" | "decrease" | "no_change" =
    totalSpending > previousTotalSpending
      ? "increase"
      : totalSpending < previousTotalSpending
      ? "decrease"
      : "no_change";

  // 6. Category breakdown via Prisma groupBy
  const categoryGroups = await prisma.expense.groupBy({
    by: ["categoryId", "categoryNameSnapshot"],
    where: currentWhere,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  // Fetch current user categories to map colors, icons, and active status
  const userCategories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true, icon: true, isArchived: true },
  });
  const categoryMap = new Map(userCategories.map((c) => [c.id, c]));

  // Combine and consolidate category breakdown
  interface CategoryBreakdownItem {
    categoryId: string | null;
    name: string;
    color: string;
    icon: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
    isArchived: boolean;
    isDeleted: boolean;
  }

  const categoryBreakdown: CategoryBreakdownItem[] = categoryGroups.map((group) => {
    const activeCat = group.categoryId ? categoryMap.get(group.categoryId) : null;
    const amount = group._sum.amount ? Math.round(Number(group._sum.amount) * 100) / 100 : 0;
    const count = group._count.id;
    const percentage = totalSpending > 0 ? Math.round((amount / totalSpending) * 1000) / 10 : 0;

    const isOriginallyUncategorized =
      !group.categoryId &&
      (!group.categoryNameSnapshot ||
        group.categoryNameSnapshot === "غير مصنف" ||
        group.categoryNameSnapshot === "بدون تصنيف");

    const isDeleted = !isOriginallyUncategorized && (!group.categoryId || !activeCat);
    const isArchived = Boolean(activeCat?.isArchived);

    // Fallback name: current category name -> snapshot -> "بدون تصنيف"
    const displayName =
      activeCat?.name ??
      (group.categoryNameSnapshot && group.categoryNameSnapshot.trim() !== ""
        ? group.categoryNameSnapshot
        : "بدون تصنيف");

    const displayColor =
      activeCat?.color ?? (isDeleted ? "#DC2626" : group.categoryId ? "#0D9488" : "#64748B");
    const displayIcon =
      activeCat?.icon ?? (isDeleted ? "ArchiveX" : group.categoryId ? "Tag" : "HelpCircle");

    return {
      categoryId: group.categoryId,
      name: displayName,
      color: displayColor,
      icon: displayIcon,
      totalAmount: amount,
      expenseCount: count,
      percentage,
      isArchived,
      isDeleted,
    };
  });

  // 7. Spending over time (Time Series)
  const daysDiff =
    Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  let timeSeriesInterval: "day" | "week" | "month";
  if (daysDiff <= 35) {
    timeSeriesInterval = "day";
  } else if (daysDiff <= 180) {
    timeSeriesInterval = "week";
  } else {
    timeSeriesInterval = "month";
  }

  const expensesForChart = await prisma.expense.findMany({
    where: currentWhere,
    select: {
      expenseDate: true,
      amount: true,
    },
    orderBy: {
      expenseDate: "asc",
    },
  });

  // Build time series buckets with gap filling
  interface TimeSeriesPoint {
    date: string;
    label: string;
    amount: number;
    count: number;
  }

  const timeSeries: TimeSeriesPoint[] = [];

  if (timeSeriesInterval === "day") {
    const bucketMap = new Map<string, { amount: number; count: number }>();
    const cur = new Date(startDate.getTime());
    while (cur.getTime() <= endDate.getTime()) {
      const key = cur.toISOString().slice(0, 10);
      bucketMap.set(key, { amount: 0, count: 0 });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    for (const exp of expensesForChart) {
      const key = exp.expenseDate.toISOString().slice(0, 10);
      const b = bucketMap.get(key);
      if (b) {
        b.amount += Number(exp.amount);
        b.count += 1;
      }
    }

    bucketMap.forEach((val, key) => {
      const d = new Date(key);
      const dayName = new Intl.DateTimeFormat("ar-PS", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      }).format(d);

      timeSeries.push({
        date: key,
        label: dayName,
        amount: Math.round(val.amount * 100) / 100,
        count: val.count,
      });
    });
  } else if (timeSeriesInterval === "week") {
    // 7-day intervals starting from startDate
    let weekStart = new Date(startDate.getTime());
    let weekIndex = 1;
    while (weekStart.getTime() <= endDate.getTime()) {
      const weekEnd = new Date(
        Math.min(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000, endDate.getTime()),
      );
      const label = `أسبوع ${weekIndex} (${weekStart.getUTCDate()}/${weekStart.getUTCMonth() + 1})`;
      const dateKey = weekStart.toISOString().slice(0, 10);

      let weekAmount = 0;
      let weekCount = 0;

      for (const exp of expensesForChart) {
        const t = exp.expenseDate.getTime();
        if (t >= weekStart.getTime() && t <= weekEnd.getTime()) {
          weekAmount += Number(exp.amount);
          weekCount += 1;
        }
      }

      timeSeries.push({
        date: dateKey,
        label,
        amount: Math.round(weekAmount * 100) / 100,
        count: weekCount,
      });

      weekStart = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000);
      weekIndex++;
    }
  } else {
    // Monthly intervals
    let curMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    const endMonth = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));

    while (curMonth.getTime() <= endMonth.getTime()) {
      const mY = curMonth.getUTCFullYear();
      const mM = curMonth.getUTCMonth();
      const mEnd = new Date(Date.UTC(mY, mM + 1, 0));
      const key = `${mY}-${String(mM + 1).padStart(2, "0")}`;

      const label = new Intl.DateTimeFormat("ar-PS", {
        month: "short",
        year: "numeric",
      }).format(curMonth);

      let mAmount = 0;
      let mCount = 0;

      for (const exp of expensesForChart) {
        const t = exp.expenseDate.getTime();
        if (t >= curMonth.getTime() && t <= mEnd.getTime()) {
          mAmount += Number(exp.amount);
          mCount += 1;
        }
      }

      timeSeries.push({
        date: key,
        label,
        amount: Math.round(mAmount * 100) / 100,
        count: mCount,
      });

      curMonth = new Date(Date.UTC(mY, mM + 1, 1));
    }
  }

  // 8. Budget metrics: ONLY when period is a budget cycle (current_cycle or cycle)
  let budgetMetrics = null;
  if (cycle) {
    const budgetAmount = Number(cycle.budgetAmount);

    // Sum all expenses attached to this specific cycle
    const cycleExpenseAgg = await prisma.expense.aggregate({
      where: { budgetCycleId: cycle.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    const cycleTotalExpenses = cycleExpenseAgg._sum.amount
      ? Math.round(Number(cycleExpenseAgg._sum.amount) * 100) / 100
      : 0;
    const remainingBudget = Math.round((budgetAmount - cycleTotalExpenses) * 100) / 100;
    const utilizationPercentage =
      budgetAmount > 0 ? Math.round((cycleTotalExpenses / budgetAmount) * 1000) / 10 : 0;
    const isOverBudget = cycleTotalExpenses > budgetAmount;

    budgetMetrics = {
      cycleId: cycle.id,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      budgetAmount,
      totalExpenses: cycleTotalExpenses,
      remainingBudget,
      utilizationPercentage,
      isOverBudget,
      expenseCount: cycleExpenseAgg._count.id,
    };
  }

  // 9. Top / filtered recent expenses in this period
  const sortBy = input.sortBy === "amount" ? "amount" : "expenseDate";
  const sortOrder = input.order ?? "desc";

  const expensesSample = await prisma.expense.findMany({
    where: currentWhere,
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: 20,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  });

  const formattedExpenses = expensesSample.map((exp) => ({
    id: exp.id,
    amount: Number(exp.amount),
    categoryId: exp.categoryId,
    categoryName: exp.category?.name ?? exp.categoryNameSnapshot,
    categoryIcon: exp.category?.icon ?? null,
    categoryColor: exp.category?.color ?? null,
    description: exp.description,
    date: exp.expenseDate,
    expenseDate: exp.expenseDate,
    budgetCycleId: exp.budgetCycleId,
    createdAt: exp.createdAt,
  }));

  return {
    period: periodInfo.period,
    periodLabel: periodInfo.periodLabel,
    startDate,
    endDate,
    currency,
    summary: {
      totalSpending,
      expenseCount,
      averageExpense,
      minExpense,
      maxExpense,
    },
    comparison: {
      previousPeriodLabel: periodInfo.prevPeriodLabel,
      prevStartDate,
      prevEndDate,
      previousTotalSpending,
      previousExpenseCount,
      spendingChange,
      percentageChange,
      trend,
    },
    budgetMetrics,
    categoryBreakdown,
    timeSeries: {
      interval: timeSeriesInterval,
      data: timeSeries,
    },
    expenses: formattedExpenses,
  };
}

/**
 * Retrieves all persisted budget cycles for the user with spending summaries.
 */
export async function fetchUserBudgetCycles(userId: string) {
  const cycles = await prisma.budgetCycle.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { expenses: true },
      },
    },
  });

  const today = toUTCDateOnly(new Date());

  const cycleExpenses = await prisma.expense.groupBy({
    by: ["budgetCycleId"],
    where: { userId },
    _sum: { amount: true },
  });

  const expenseMap = new Map(
    cycleExpenses.map((c) => [c.budgetCycleId, c._sum.amount ? Number(c._sum.amount) : 0]),
  );

  return cycles.map((c) => {
    const budgetAmount = Number(c.budgetAmount);
    const totalExpenses = expenseMap.get(c.id) ?? 0;
    const remainingBudget = Math.round((budgetAmount - totalExpenses) * 100) / 100;
    const percentageUsed =
      budgetAmount > 0 ? Math.round((totalExpenses / budgetAmount) * 1000) / 10 : 0;
    const isCompleted = today.getTime() > c.endDate.getTime();
    const isCurrent =
      today.getTime() >= c.startDate.getTime() && today.getTime() <= c.endDate.getTime();

    return {
      id: c.id,
      startDate: c.startDate,
      endDate: c.endDate,
      budgetAmount,
      totalExpenses,
      remainingBudget,
      percentageUsed,
      isCompleted,
      isCurrent,
      expenseCount: c._count.expenses,
      createdAt: c.createdAt,
    };
  });
}
