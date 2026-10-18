import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import { resolveBudgetCycle } from "./budget-cycle.service.js";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "../schemas/expense.schema.js";
import type { Prisma } from "../../generated/prisma/client.js";

export interface FormattedExpense {
  id: string;
  amount: number;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  description: string | null;
  date: Date;
  expenseDate: Date;
  budgetCycleId: string;
  createdAt: Date;
  updatedAt: Date;
}

function formatExpense(expense: {
  id: string;
  amount: Prisma.Decimal;
  categoryId: string | null;
  categoryNameSnapshot: string;
  description: string | null;
  expenseDate: Date;
  budgetCycleId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}): FormattedExpense {
  return {
    id: expense.id,
    amount: Number(expense.amount),
    categoryId: expense.categoryId,
    categoryName: expense.category?.name ?? expense.categoryNameSnapshot,
    categoryIcon: expense.category?.icon ?? null,
    categoryColor: expense.category?.color ?? null,
    description: expense.description,
    date: expense.expenseDate,
    expenseDate: expense.expenseDate,
    budgetCycleId: expense.budgetCycleId,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

export async function fetchExpenses(userId: string, filters: ExpenseFilters) {
  const where: Prisma.ExpenseWhereInput = {
    userId,
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...((filters.startDate || filters.endDate)
      ? {
          expenseDate: {
            ...(filters.startDate ? { gte: filters.startDate } : {}),
            ...(filters.endDate ? { lte: filters.endDate } : {}),
          },
        }
      : {}),
    ...((filters.minAmount !== undefined || filters.maxAmount !== undefined)
      ? {
          amount: {
            ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
            ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
          },
        }
      : {}),
  };

  const sortBy = filters.sortBy === "amount" ? "amount" : "expenseDate";
  const order = filters.order ?? "desc";

  const total = await prisma.expense.count({ where });

  const page = filters.page;
  const limit = filters.limit;
  const skip = (page - 1) * limit;

  const rawExpenses = await prisma.expense.findMany({
    where,
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
    orderBy: {
      [sortBy]: order,
    },
    skip,
    take: limit,
  });

  return {
    data: rawExpenses.map(formatExpense),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function fetchExpenseById(
  userId: string,
  id: string,
): Promise<FormattedExpense | null> {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      userId,
    },
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

  return expense ? formatExpense(expense) : null;
}

export async function addExpense(
  userId: string,
  input: CreateExpenseInput,
): Promise<FormattedExpense> {
  let categoryNameSnapshot = "غير مصنف";
  let validCategoryId: string | null = null;

  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        userId,
      },
    });

    if (!category) {
      throw new AppError(400, "Category not found or does not belong to user");
    }

    categoryNameSnapshot = category.name;
    validCategoryId = category.id;
  }

  const expenseDate = input.date;
  const budgetCycle = await resolveBudgetCycle(userId, expenseDate);

  const expense = await prisma.expense.create({
    data: {
      userId,
      budgetCycleId: budgetCycle.id,
      categoryId: validCategoryId,
      categoryNameSnapshot,
      description: input.description ?? null,
      amount: input.amount,
      expenseDate,
    },
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

  return formatExpense(expense);
}

export async function updateExpense(
  userId: string,
  id: string,
  input: UpdateExpenseInput,
): Promise<FormattedExpense | null> {
  const existing = await prisma.expense.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    return null;
  }

  let updatedCategoryId: string | null | undefined = undefined;
  let updatedCategoryNameSnapshot: string | undefined = undefined;

  if (input.categoryId !== undefined) {
    if (input.categoryId === null) {
      updatedCategoryId = null;
      updatedCategoryNameSnapshot = "غير مصنف";
    } else {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new AppError(400, "Category not found or does not belong to user");
      }

      updatedCategoryId = category.id;
      updatedCategoryNameSnapshot = category.name;
    }
  }

  let updatedExpenseDate: Date | undefined = undefined;
  let updatedBudgetCycleId: string | undefined = undefined;

  const newDate = input.expenseDate ?? input.date;
  if (newDate) {
    updatedExpenseDate = newDate;
    const cycle = await resolveBudgetCycle(userId, newDate);
    updatedBudgetCycleId = cycle.id;
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(updatedCategoryId !== undefined ? { categoryId: updatedCategoryId } : {}),
      ...(updatedCategoryNameSnapshot !== undefined
        ? { categoryNameSnapshot: updatedCategoryNameSnapshot }
        : {}),
      ...(updatedExpenseDate ? { expenseDate: updatedExpenseDate } : {}),
      ...(updatedBudgetCycleId ? { budgetCycleId: updatedBudgetCycleId } : {}),
    },
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

  return formatExpense(updated);
}

export async function removeExpense(
  userId: string,
  id: string,
): Promise<boolean> {
  const existing = await prisma.expense.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.expense.delete({
    where: { id },
  });

  return true;
}