import { prisma } from "../lib/prisma.js";
import { toUTCDateOnly } from "./budget-cycle.service.js";
import type { BudgetSetupInput } from "../schemas/settings.schema.js";

export interface FormattedUserSettings {
  id: string;
  userId: string;
  currency: string;
  budgetRenewalDay: number;
  defaultBudgetAmount: number | null;
  budgetSetupCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserSettings(userId: string): Promise<FormattedUserSettings> {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      currency: true,
      budgetRenewalDay: true,
      defaultBudgetAmount: true,
      budgetSetupCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        currency: "ILS",
        budgetRenewalDay: 1,
        defaultBudgetAmount: null,
        budgetSetupCompleted: false,
      },
      select: {
        id: true,
        userId: true,
        currency: true,
        budgetRenewalDay: true,
        defaultBudgetAmount: true,
        budgetSetupCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return {
    ...settings,
    defaultBudgetAmount: settings.defaultBudgetAmount
      ? Number(settings.defaultBudgetAmount)
      : null,
  };
}

export async function updateBudgetSetup(
  userId: string,
  input: BudgetSetupInput,
): Promise<FormattedUserSettings> {
  const updated = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      currency: input.currency,
      budgetRenewalDay: input.budgetRenewalDay,
      ...(input.defaultBudgetAmount !== undefined
        ? { defaultBudgetAmount: input.defaultBudgetAmount }
        : {}),
      budgetSetupCompleted: true,
    },
    create: {
      userId,
      currency: input.currency,
      budgetRenewalDay: input.budgetRenewalDay,
      defaultBudgetAmount: input.defaultBudgetAmount ?? null,
      budgetSetupCompleted: true,
    },
    select: {
      id: true,
      userId: true,
      currency: true,
      budgetRenewalDay: true,
      defaultBudgetAmount: true,
      budgetSetupCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // If defaultBudgetAmount was provided, immediately update current active cycle if it exists
  if (input.defaultBudgetAmount !== undefined && input.defaultBudgetAmount !== null) {
    const today = toUTCDateOnly(new Date());
    const currentCycle = await prisma.budgetCycle.findFirst({
      where: {
        userId,
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    if (currentCycle) {
      await prisma.budgetCycle.update({
        where: { id: currentCycle.id },
        data: {
          budgetAmount: input.defaultBudgetAmount,
        },
      });
    }
  }

  return {
    ...updated,
    defaultBudgetAmount: updated.defaultBudgetAmount
      ? Number(updated.defaultBudgetAmount)
      : null,
  };
}

export async function updateDefaultBudget(
  userId: string,
  defaultBudgetAmount: number,
): Promise<FormattedUserSettings> {
  const updated = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      defaultBudgetAmount,
      budgetSetupCompleted: true,
    },
    create: {
      userId,
      currency: "ILS",
      budgetRenewalDay: 1,
      defaultBudgetAmount,
      budgetSetupCompleted: true,
    },
    select: {
      id: true,
      userId: true,
      currency: true,
      budgetRenewalDay: true,
      defaultBudgetAmount: true,
      budgetSetupCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const today = toUTCDateOnly(new Date());
  const currentCycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  if (currentCycle) {
    await prisma.budgetCycle.update({
      where: { id: currentCycle.id },
      data: {
        budgetAmount: defaultBudgetAmount,
      },
    });
  }

  return {
    ...updated,
    defaultBudgetAmount: updated.defaultBudgetAmount
      ? Number(updated.defaultBudgetAmount)
      : null,
  };
}
