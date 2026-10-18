import { prisma } from "../lib/prisma.js";
import type { BudgetSetupInput } from "../schemas/settings.schema.js";

export async function getUserSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      currency: true,
      budgetRenewalDay: true,
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
        budgetSetupCompleted: false,
      },
      select: {
        id: true,
        userId: true,
        currency: true,
        budgetRenewalDay: true,
        budgetSetupCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return settings;
}

export async function updateBudgetSetup(userId: string, input: BudgetSetupInput) {
  const updatedSettings = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      currency: input.currency,
      budgetRenewalDay: input.budgetRenewalDay,
      budgetSetupCompleted: true,
    },
    create: {
      userId,
      currency: input.currency,
      budgetRenewalDay: input.budgetRenewalDay,
      budgetSetupCompleted: true,
    },
    select: {
      id: true,
      userId: true,
      currency: true,
      budgetRenewalDay: true,
      budgetSetupCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedSettings;
}
