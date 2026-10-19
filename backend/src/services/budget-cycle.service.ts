import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import type { BudgetCycle } from "../../generated/prisma/client.js";

/**
 * Truncates a date to UTC midnight (date-only)
 */
export function toUTCDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Calculates the exact renewal date for a given year and month (0-indexed),
 * safely clamping to the actual number of days in that month.
 */
export function getRenewalDateForMonth(year: number, month: number, renewalDay: number): Date {
  const safeDay = Math.min(Math.max(1, Math.floor(renewalDay)), 31);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clampedDay = Math.min(safeDay, daysInMonth);
  return new Date(Date.UTC(year, month, clampedDay));
}

/**
 * Computes the cycle start date and cycle end date that covers the given date,
 * respecting the user's configured renewal day (1-31) and handling shorter months.
 * Guarantees contiguous cycles with no gaps or overlaps.
 */
export function calculateCycleDateRange(targetDate: Date, renewalDay: number): {
  startDate: Date;
  endDate: Date;
} {
  const dateOnly = toUTCDateOnly(targetDate);
  const safeRenewalDay = Math.min(Math.max(1, Math.floor(renewalDay)), 31);
  const y = dateOnly.getUTCFullYear();
  const m = dateOnly.getUTCMonth();

  const currentMonthRenewal = getRenewalDateForMonth(y, m, safeRenewalDay);

  let cycleStartDate: Date;
  let nextCycleStartDate: Date;

  if (dateOnly.getTime() >= currentMonthRenewal.getTime()) {
    cycleStartDate = currentMonthRenewal;
    const nextYear = m === 11 ? y + 1 : y;
    const nextMonth = (m + 1) % 12;
    nextCycleStartDate = getRenewalDateForMonth(nextYear, nextMonth, safeRenewalDay);
  } else {
    const prevYear = m === 0 ? y - 1 : y;
    const prevMonth = (m + 11) % 12;
    cycleStartDate = getRenewalDateForMonth(prevYear, prevMonth, safeRenewalDay);
    nextCycleStartDate = currentMonthRenewal;
  }

  // The cycle ends on the day immediately preceding the next cycle's renewal date
  const cycleEndDate = new Date(nextCycleStartDate.getTime() - 24 * 60 * 60 * 1000);

  return {
    startDate: cycleStartDate,
    endDate: cycleEndDate,
  };
}

/**
 * Resolves or creates a BudgetCycle record in PostgreSQL for the given user and expense date.
 * Guarantees that:
 * 1. An existing cycle covering the date is reused if present without modifying its saved budget.
 * 2. If creating a new cycle, budgetAmount is initialized from UserSettings.defaultBudgetAmount.
 * 3. Does not silently use zero for missing default budget; requires setup.
 * 4. User settings (budgetRenewalDay) are loaded and respected.
 * 5. Concurrent requests are handled safely without duplicate key failures.
 */
export async function resolveBudgetCycle(
  userId: string,
  targetDate: Date,
): Promise<BudgetCycle> {
  const dateOnly = toUTCDateOnly(targetDate);

  // 1. Check if an existing budget cycle already covers this expense date
  const existingCoveringCycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: dateOnly },
      endDate: { gte: dateOnly },
    },
    orderBy: { startDate: "desc" },
  });

  if (existingCoveringCycle) {
    return existingCoveringCycle;
  }

  // 2. Fetch user settings to obtain the configured renewal day and default budget amount
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings || !settings.budgetSetupCompleted || settings.defaultBudgetAmount === null) {
    throw new AppError(
      400,
      "Budget setup has not been completed. A default budget amount must be configured before creating budget cycles."
    );
  }

  const renewalDay = settings.budgetRenewalDay ?? 1;
  const initialBudgetAmount = settings.defaultBudgetAmount;

  // 3. Compute start and end dates for the cycle
  const { startDate, endDate } = calculateCycleDateRange(dateOnly, renewalDay);

  // 4. Upsert the cycle to prevent duplicate cycles during concurrent requests
  try {
    return await prisma.budgetCycle.upsert({
      where: {
        userId_startDate: {
          userId,
          startDate,
        },
      },
      update: {}, // Reuse existing record without overwriting its saved budget amount
      create: {
        userId,
        startDate,
        endDate,
        budgetAmount: initialBudgetAmount,
      },
    });
  } catch {
    // If concurrent insert occurred, retrieve the newly created record
    const cycle = await prisma.budgetCycle.findFirst({
      where: {
        userId,
        startDate: { lte: dateOnly },
        endDate: { gte: dateOnly },
      },
    });

    if (cycle) {
      return cycle;
    }

    throw new AppError(500, "Failed to resolve or create budget cycle");
  }
}

export interface FormattedBudgetCycle {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  percentageUsed: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Formats a BudgetCycle with spending totals and progress metrics.
 */
export async function formatBudgetCycleWithExpenses(
  cycle: BudgetCycle,
): Promise<FormattedBudgetCycle> {
  const expenseAgg = await prisma.expense.aggregate({
    where: { budgetCycleId: cycle.id },
    _sum: { amount: true },
  });

  const totalExpenses = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;
  const budgetAmount = Number(cycle.budgetAmount);
  const remainingBudget = Math.max(0, budgetAmount - totalExpenses);
  const percentageUsed = budgetAmount > 0 ? Math.min(100, Math.round((totalExpenses / budgetAmount) * 100)) : 0;
  const today = toUTCDateOnly(new Date());
  const isCompleted = today.getTime() > cycle.endDate.getTime();

  return {
    id: cycle.id,
    userId: cycle.userId,
    startDate: cycle.startDate,
    endDate: cycle.endDate,
    budgetAmount,
    totalExpenses,
    remainingBudget,
    percentageUsed,
    isCompleted,
    createdAt: cycle.createdAt,
    updatedAt: cycle.updatedAt,
  };
}

/**
 * Returns the current active budget cycle for the user, if one exists or can be resolved.
 */
export async function getCurrentBudgetCycle(userId: string): Promise<FormattedBudgetCycle | null> {
  const today = toUTCDateOnly(new Date());

  // 1. Try to find existing covering cycle
  let cycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: { startDate: "desc" },
  });

  if (!cycle) {
    // Check if user has settings with default budget configured
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (settings && settings.budgetSetupCompleted && settings.defaultBudgetAmount !== null) {
      // Create active cycle with default budget
      cycle = await resolveBudgetCycle(userId, today);
    }
  }

  if (!cycle) {
    return null;
  }

  return formatBudgetCycleWithExpenses(cycle);
}

/**
 * Updates the budgetAmount of the current active budget cycle.
 * Does NOT change defaultBudgetAmount or any other cycles.
 * Preserves all existing expenses.
 */
export async function updateCurrentCycleBudget(
  userId: string,
  newBudgetAmount: number,
): Promise<FormattedBudgetCycle> {
  const today = toUTCDateOnly(new Date());

  let cycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  if (!cycle) {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (settings && settings.budgetSetupCompleted && settings.defaultBudgetAmount !== null) {
      cycle = await resolveBudgetCycle(userId, today);
    } else {
      throw new AppError(404, "Active budget cycle not found. Please complete budget setup first.");
    }
  }

  // Ensure cycle has not ended
  if (today.getTime() > cycle.endDate.getTime()) {
    throw new AppError(400, "Cannot edit budget for a completed cycle");
  }

  const updatedCycle = await prisma.budgetCycle.update({
    where: { id: cycle.id },
    data: { budgetAmount: newBudgetAmount },
  });

  return formatBudgetCycleWithExpenses(updatedCycle);
}

/**
 * Updates a specific budget cycle by ID.
 * Validates ownership, checks that the cycle is the active cycle and has not ended.
 * Does NOT change defaultBudgetAmount or other cycles.
 */
export async function updateCycleBudgetById(
  userId: string,
  cycleId: string,
  newBudgetAmount: number,
): Promise<FormattedBudgetCycle> {
  const cycle = await prisma.budgetCycle.findUnique({
    where: { id: cycleId },
  });

  if (!cycle || cycle.userId !== userId) {
    throw new AppError(404, "Budget cycle not found");
  }

  const today = toUTCDateOnly(new Date());

  if (today.getTime() > cycle.endDate.getTime()) {
    throw new AppError(400, "Cannot edit budget for a completed cycle");
  }

  if (today.getTime() < cycle.startDate.getTime()) {
    throw new AppError(400, "Cannot edit budget for a future cycle that has not started");
  }

  const updatedCycle = await prisma.budgetCycle.update({
    where: { id: cycleId },
    data: { budgetAmount: newBudgetAmount },
  });

  return formatBudgetCycleWithExpenses(updatedCycle);
}
