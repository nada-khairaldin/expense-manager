import { prisma } from "../lib/prisma.js";
import { toUTCDateOnly, resolveBudgetCycle } from "./budget-cycle.service.js";
import { evaluateThreshold } from "../utils/threshold.js";
import type { BudgetCycle } from "../../generated/prisma/client.js";

export interface DashboardResponse {
  isSetupNeeded: boolean;
  currency: string;
  selectedPeriod: "current" | "previous";
  periodLabel: string;
  periodDateRange: string;
  budget: {
    id: string;
    startDate: Date;
    endDate: Date;
    budgetAmount: number;
    totalExpenses: number;
    remainingBudget: number;
    consumptionPercentage: number;
    isOverBudget: boolean;
    status: string;
    level: string;
    color: string;
    warningMessage?: string | undefined;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    spent: number;
    limit: number | null;
    remaining: number | null;
    percentage: number | null;
    status: string;
    level: string;
    colorStatus: string;
    warningMessage?: string | undefined;
    transactionCount: number;
  }>;
  dailySpending: Array<{
    dayLabel: string;
    fullDate: string;
    amount: number;
    count: number;
  }>;
  recentExpenses: Array<{
    id: string;
    amount: number;
    categoryId: string | null;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    description: string | null;
    date: Date;
    expenseDate: Date;
  }>;
  availableCycles: {
    current: {
      id: string;
      label: string;
      startDate: Date;
      endDate: Date;
    } | null;
    previous: {
      id: string;
      label: string;
      startDate: Date;
      endDate: Date;
    } | null;
  };
}

/**
 * Retrieves full authoritative dashboard data for the user.
 */
export async function getDashboardData(
  userId: string,
  period: "current" | "previous" = "current",
): Promise<DashboardResponse> {
  const today = toUTCDateOnly(new Date());

  // 1. Fetch user settings
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const currency = settings?.currency ?? "ILS";
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "JOD" ? "د.أ" : "₪";

  // Check if budget setup is completed
  const isSetupNeeded =
    !settings || !settings.budgetSetupCompleted || settings.defaultBudgetAmount === null;

  // 2. Resolve Current Active Cycle
  let activeCycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: { startDate: "desc" },
  });

  if (!activeCycle && !isSetupNeeded) {
    try {
      activeCycle = await resolveBudgetCycle(userId, today);
    } catch {
      activeCycle = null;
    }
  }

  // 3. Resolve Previous Budget Cycle
  let prevCycle: BudgetCycle | null = null;
  if (activeCycle) {
    prevCycle = await prisma.budgetCycle.findFirst({
      where: {
        userId,
        endDate: { lt: activeCycle.startDate },
      },
      orderBy: { endDate: "desc" },
    });
  } else {
    // If no active cycle, check latest existing
    prevCycle = await prisma.budgetCycle.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });
  }

  // Choose the cycle according to requested period
  const selectedCycle = period === "previous" ? (prevCycle ?? activeCycle) : activeCycle;

  // If no cycle exists at all
  if (!selectedCycle) {
    return {
      isSetupNeeded: true,
      currency,
      selectedPeriod: period,
      periodLabel: "الدورة الحالية",
      periodDateRange: "لم يتم تحديد دورة بعد",
      budget: null,
      categories: [],
      dailySpending: [],
      recentExpenses: [],
      availableCycles: {
        current: null,
        previous: null,
      },
    };
  }

  // 4. Calculate Selected Cycle Financials
  const budgetAmount = Number(selectedCycle.budgetAmount);

  const [cycleExpensesAgg, expensesInCycle] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId,
        budgetCycleId: selectedCycle.id,
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        budgetCycleId: selectedCycle.id,
      },
      select: {
        amount: true,
        expenseDate: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    }),
  ]);

  const totalExpenses = cycleExpensesAgg._sum.amount
    ? Math.round(Number(cycleExpensesAgg._sum.amount) * 100) / 100
    : 0;

  const remainingBudget = Math.round((budgetAmount - totalExpenses) * 100) / 100;
  const rawPercentage = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
  const consumptionPercentage = Math.round(rawPercentage * 10) / 10;
  const isOverBudget = totalExpenses > budgetAmount;

  // Evaluate warning thresholds for overall budget
  const budgetThreshold = evaluateThreshold(
    totalExpenses,
    budgetAmount,
    "الميزانية العامة",
    currencySymbol,
  );

  // 5. Category Breakdown for the Cycle
  const [categoriesGrouped, userCategories] = await Promise.all([
    prisma.expense.groupBy({
      by: ["categoryId", "categoryNameSnapshot"],
      where: {
        userId,
        budgetCycleId: selectedCycle.id,
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.category.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const categoryMap = new Map(userCategories.map((c) => [c.id, c]));

  // Build spent mapping for each active category
  const activeCategorySpending = new Map<string, { spent: number; count: number }>();
  let uncategorizedSpent = 0;
  let uncategorizedCount = 0;

  for (const group of categoriesGrouped) {
    const amt = group._sum.amount ? Math.round(Number(group._sum.amount) * 100) / 100 : 0;
    const cnt = group._count.id;

    if (group.categoryId && categoryMap.has(group.categoryId)) {
      const cur = activeCategorySpending.get(group.categoryId) ?? { spent: 0, count: 0 };
      cur.spent += amt;
      cur.count += cnt;
      activeCategorySpending.set(group.categoryId, cur);
    } else {
      // Either deleted category or uncategorized
      uncategorizedSpent += amt;
      uncategorizedCount += cnt;
    }
  }

  const categoryCards = userCategories.map((cat) => {
    const limit = cat.monthlyLimit !== null ? Number(cat.monthlyLimit) : null;
    const spendingData = activeCategorySpending.get(cat.id) ?? { spent: 0, count: 0 };
    const spent = Math.round(spendingData.spent * 100) / 100;

    const threshold = evaluateThreshold(spent, limit, cat.name, currencySymbol);

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon || "Layers",
      color: cat.color || "#16856B",
      spent,
      limit,
      remaining: threshold.remaining,
      percentage: threshold.percentage,
      status: threshold.status,
      level: threshold.level,
      colorStatus: threshold.color,
      warningMessage: threshold.message,
      transactionCount: spendingData.count,
    };
  });

  // If there are uncategorized or deleted-category expenses in this cycle, include them
  if (uncategorizedSpent > 0 || uncategorizedCount > 0) {
    categoryCards.push({
      id: "uncategorized",
      name: "بدون تصنيف / أخرى",
      icon: "Layers",
      color: "#64748B",
      spent: Math.round(uncategorizedSpent * 100) / 100,
      limit: null,
      remaining: null,
      percentage: null,
      status: "no_limit",
      level: "none",
      colorStatus: "gray",
      warningMessage: undefined,
      transactionCount: uncategorizedCount,
    });
  }

  // 6. Build Daily Spending Trajectory with Gap-Filling
  const cycleStart = new Date(selectedCycle.startDate.getTime());
  const cycleEnd = new Date(selectedCycle.endDate.getTime());
  // For daily trajectory, chart up to the end of cycle or today
  const chartEnd = period === "current" && today.getTime() <= cycleEnd.getTime()
    ? today
    : cycleEnd;

  const dayBuckets = new Map<string, { amount: number; count: number }>();
  const curDay = new Date(cycleStart.getTime());
  while (curDay.getTime() <= chartEnd.getTime()) {
    const key = curDay.toISOString().slice(0, 10);
    dayBuckets.set(key, { amount: 0, count: 0 });
    curDay.setUTCDate(curDay.getUTCDate() + 1);
  }

  for (const exp of expensesInCycle) {
    const key = exp.expenseDate.toISOString().slice(0, 10);
    const b = dayBuckets.get(key);
    if (b) {
      b.amount += Number(exp.amount);
      b.count += 1;
    }
  }

  const dailySpending: Array<{
    dayLabel: string;
    fullDate: string;
    amount: number;
    count: number;
  }> = [];

  dayBuckets.forEach((val, key) => {
    const d = new Date(key);
    const dayLabel = new Intl.DateTimeFormat("ar-PS", {
      day: "numeric",
      month: "short",
    }).format(d);

    dailySpending.push({
      dayLabel,
      fullDate: key,
      amount: Math.round(val.amount * 100) / 100,
      count: val.count,
    });
  });

  // 7. Recent Expenses (latest 6 in this cycle, with deterministic fallback)
  const recentRaw = await prisma.expense.findMany({
    where: {
      userId,
      budgetCycleId: selectedCycle.id,
    },
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  const recentExpenses = recentRaw.map((exp) => ({
    id: exp.id,
    amount: Number(exp.amount),
    categoryId: exp.categoryId,
    categoryName: exp.category?.name ?? exp.categoryNameSnapshot,
    categoryIcon: exp.category?.icon ?? null,
    categoryColor: exp.category?.color ?? null,
    description: exp.description,
    date: exp.expenseDate,
    expenseDate: exp.expenseDate,
  }));

  // 8. Period Labels & Formatters
  const periodLabel =
    period === "current" ? "الدورة الحالية" : "الدورة السابقة";

  const dateRangeFormatter = new Intl.DateTimeFormat("ar-PS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const periodDateRange = `${dateRangeFormatter.format(selectedCycle.startDate)} — ${dateRangeFormatter.format(selectedCycle.endDate)}`;

  const currentCycleMeta = activeCycle
    ? {
        id: activeCycle.id,
        label: "الدورة الحالية",
        startDate: activeCycle.startDate,
        endDate: activeCycle.endDate,
      }
    : null;

  const prevCycleMeta = prevCycle
    ? {
        id: prevCycle.id,
        label: "الدورة السابقة",
        startDate: prevCycle.startDate,
        endDate: prevCycle.endDate,
      }
    : null;

  return {
    isSetupNeeded,
    currency,
    selectedPeriod: period,
    periodLabel,
    periodDateRange,
    budget: {
      id: selectedCycle.id,
      startDate: selectedCycle.startDate,
      endDate: selectedCycle.endDate,
      budgetAmount,
      totalExpenses,
      remainingBudget,
      consumptionPercentage,
      isOverBudget,
      status: budgetThreshold.status,
      level: budgetThreshold.level,
      color: budgetThreshold.color,
      warningMessage: budgetThreshold.message,
    },
    categories: categoryCards,
    dailySpending,
    recentExpenses,
    availableCycles: {
      current: currentCycleMeta,
      previous: prevCycleMeta,
    },
  };
}
