import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import { toUTCDateOnly } from "./budget-cycle.service.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema.js";
import type { Prisma } from "../../generated/prisma/client.js";

export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthlyLimit: number | null;
  limit: number | null;
  spent: number | null;
  transactionCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function formatCategory(
  raw: {
    id: string;
    userId: string;
    name: string;
    icon: string | null;
    color: string | null;
    monthlyLimit: Prisma.Decimal | null | number;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  metrics?: { spent: number; transactionCount: number }
): Category {
  const limitNum =
    raw.monthlyLimit !== null && raw.monthlyLimit !== undefined
      ? Number(raw.monthlyLimit)
      : null;

  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.name,
    icon: raw.icon,
    color: raw.color,
    monthlyLimit: limitNum,
    limit: limitNum,
    spent: metrics ? metrics.spent : 0,
    transactionCount: metrics ? metrics.transactionCount : 0,
    isArchived: raw.isArchived,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function fetchCategories(
  userId: string,
  includeArchived = false,
): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const today = toUTCDateOnly(new Date());
  const activeCycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    select: { id: true },
  });

  const metricsMap = new Map<string, { spent: number; transactionCount: number }>();
  if (activeCycle) {
    const expensesGrouped = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        budgetCycleId: activeCycle.id,
        categoryId: { not: null },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    for (const g of expensesGrouped) {
      if (g.categoryId) {
        metricsMap.set(g.categoryId, {
          spent: g._sum.amount ? Number(g._sum.amount) : 0,
          transactionCount: g._count.id ?? 0,
        });
      }
    }
  }

  return categories.map((cat) => formatCategory(cat, metricsMap.get(cat.id)));
}

export async function fetchCategoryById(
  userId: string,
  id: string,
): Promise<Category | null> {
  const category = await prisma.category.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!category) {
    return null;
  }

  const today = toUTCDateOnly(new Date());
  const activeCycle = await prisma.budgetCycle.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    select: { id: true },
  });

  let metrics: { spent: number; transactionCount: number } | undefined = undefined;
  if (activeCycle) {
    const agg = await prisma.expense.aggregate({
      where: {
        userId,
        budgetCycleId: activeCycle.id,
        categoryId: id,
      },
      _sum: { amount: true },
      _count: { id: true },
    });
    metrics = {
      spent: agg._sum.amount ? Number(agg._sum.amount) : 0,
      transactionCount: agg._count.id ?? 0,
    };
  }

  return formatCategory(category, metrics);
}

export async function addCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  const limitVal = input.monthlyLimit !== undefined ? input.monthlyLimit : input.limit;

  const existing = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name: input.name,
      },
    },
  });

  if (existing) {
    if (existing.isArchived) {
      const revived = await prisma.category.update({
        where: { id: existing.id },
        data: {
          isArchived: false,
          color: input.color ?? existing.color,
          icon: input.icon ?? existing.icon,
          monthlyLimit: limitVal !== undefined ? limitVal : existing.monthlyLimit,
        },
      });
      return formatCategory(revived);
    }
    throw new AppError(409, "Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
      monthlyLimit: limitVal !== undefined && limitVal !== null ? limitVal : null,
    },
  });

  return formatCategory(category);
}

export async function updateCategory(
  userId: string,
  id: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return null;
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "Category with this name already exists");
    }
  }

  const limitVal = input.monthlyLimit !== undefined ? input.monthlyLimit : input.limit;

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(limitVal !== undefined ? { monthlyLimit: limitVal } : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
    },
  });

  return formatCategory(updated);
}

export async function removeCategory(
  userId: string,
  id: string,
): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!category) {
    return false;
  }

  await prisma.$transaction([
    // 1. Ensure any historical expenses linked to this category preserve the snapshot name
    prisma.expense.updateMany({
      where: {
        categoryId: id,
        userId,
        OR: [
          { categoryNameSnapshot: "" },
          { categoryNameSnapshot: "غير مصنف" },
        ],
      },
      data: {
        categoryNameSnapshot: category.name,
      },
    }),

    // 2. Set categoryId to null so historical expenses remain intact without deletion
    prisma.expense.updateMany({
      where: {
        categoryId: id,
        userId,
      },
      data: {
        categoryId: null,
      },
    }),

    // 3. Delete any category budgets configured for this category
    prisma.categoryBudget.deleteMany({
      where: { categoryId: id },
    }),

    // 4. Delete the category record
    prisma.category.delete({
      where: { id },
    }),
  ]);

  return true;
}
