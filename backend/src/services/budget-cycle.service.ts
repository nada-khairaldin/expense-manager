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
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clampedDay = Math.min(Math.max(1, renewalDay), daysInMonth);
  return new Date(Date.UTC(year, month, clampedDay));
}

/**
 * Computes the cycle start date and cycle end date that covers the given date,
 * respecting the user's configured renewal day and handling shorter months.
 */
export function calculateCycleDateRange(dateOnly: Date, renewalDay: number): {
  startDate: Date;
  endDate: Date;
} {
  const y = dateOnly.getUTCFullYear();
  const m = dateOnly.getUTCMonth();

  const currentMonthRenewal = getRenewalDateForMonth(y, m, renewalDay);

  let cycleStartDate: Date;
  let nextCycleStartDate: Date;

  if (dateOnly.getTime() >= currentMonthRenewal.getTime()) {
    cycleStartDate = currentMonthRenewal;
    const nextYear = m === 11 ? y + 1 : y;
    const nextMonth = (m + 1) % 12;
    nextCycleStartDate = getRenewalDateForMonth(nextYear, nextMonth, renewalDay);
  } else {
    const prevYear = m === 0 ? y - 1 : y;
    const prevMonth = (m + 11) % 12;
    cycleStartDate = getRenewalDateForMonth(prevYear, prevMonth, renewalDay);
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
 * 1. An existing cycle covering the date is reused if present.
 * 2. User settings (budgetRenewalDay) are loaded and respected.
 * 3. Concurrent requests are handled safely without duplicate key failures.
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
  });

  if (existingCoveringCycle) {
    return existingCoveringCycle;
  }

  // 2. Fetch user settings to obtain the configured renewal day
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const renewalDay = settings?.budgetRenewalDay ?? 1;

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
      update: {},
      create: {
        userId,
        startDate,
        endDate,
        budgetAmount: 0,
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
