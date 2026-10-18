import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema.js";

export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function fetchCategories(
  userId: string,
  includeArchived = false,
): Promise<Category[]> {
  return prisma.category.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function fetchCategoryById(
  userId: string,
  id: string,
): Promise<Category | null> {
  return prisma.category.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function addCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
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
      return prisma.category.update({
        where: { id: existing.id },
        data: {
          isArchived: false,
          color: input.color ?? existing.color,
          icon: input.icon ?? existing.icon,
        },
      });
    }
    throw new AppError(409, "Category with this name already exists");
  }

  return prisma.category.create({
    data: {
      userId,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
    },
  });
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

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
    },
  });
}

export async function removeCategory(
  userId: string,
  id: string,
): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { expenses: true },
      },
    },
  });

  if (!category) {
    return false;
  }

  // If category is linked to expenses, archive it so historical records remain intact
  if (category._count.expenses > 0) {
    await prisma.category.update({
      where: { id },
      data: { isArchived: true },
    });
    return true;
  }

  // Otherwise, hard delete
  await prisma.category.delete({
    where: { id },
  });
  return true;
}
