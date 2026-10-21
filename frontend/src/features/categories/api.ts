import { apiClient } from "@/lib/api/client";
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types";

/**
 * Fetch all categories for the authenticated user
 * GET /categories
 */
export async function getCategoriesApi(
  token: string,
  includeArchived = false
): Promise<CategoryItem[]> {
  const params: Record<string, string> = {};
  if (includeArchived) {
    params.includeArchived = "true";
  }

  const raw = await apiClient<CategoryItem[]>("/categories", {
    method: "GET",
    token,
    params,
  });

  return Array.isArray(raw)
    ? raw.map((cat) => ({
        ...cat,
        id: String(cat.id),
        limit:
          cat.limit !== undefined && cat.limit !== null
            ? Number(cat.limit)
            : cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
            ? Number(cat.monthlyLimit)
            : null,
        monthlyLimit:
          cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
            ? Number(cat.monthlyLimit)
            : cat.limit !== undefined && cat.limit !== null
            ? Number(cat.limit)
            : null,
        spent: cat.spent !== undefined && cat.spent !== null ? Number(cat.spent) : 0,
        transactionCount: cat.transactionCount ?? 0,
      }))
    : [];
}

/**
 * Fetch a single category by ID
 * GET /categories/:id
 */
export async function getCategoryByIdApi(
  id: string,
  token: string
): Promise<CategoryItem> {
  const cat = await apiClient<CategoryItem>(`/categories/${id}`, {
    method: "GET",
    token,
  });

  return {
    ...cat,
    id: String(cat.id),
    limit:
      cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : null,
    monthlyLimit:
      cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : null,
    spent: cat.spent !== undefined && cat.spent !== null ? Number(cat.spent) : 0,
    transactionCount: cat.transactionCount ?? 0,
  };
}

/**
 * Create a new category
 * POST /categories
 */
export async function createCategoryApi(
  data: CreateCategoryPayload,
  token: string
): Promise<CategoryItem> {
  const cat = await apiClient<CategoryItem>("/categories", {
    method: "POST",
    token,
    body: JSON.stringify({
      name: data.name,
      icon: data.icon,
      color: data.color,
      monthlyLimit: data.monthlyLimit ?? data.limit ?? null,
      limit: data.limit ?? data.monthlyLimit ?? null,
    }),
  });

  return {
    ...cat,
    id: String(cat.id),
    limit:
      cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : null,
    monthlyLimit:
      cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : null,
    spent: cat.spent !== undefined && cat.spent !== null ? Number(cat.spent) : 0,
    transactionCount: cat.transactionCount ?? 0,
  };
}

/**
 * Update an existing category
 * PATCH /categories/:id
 */
export async function updateCategoryApi(
  id: string,
  data: UpdateCategoryPayload,
  token: string
): Promise<CategoryItem> {
  const cat = await apiClient<CategoryItem>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.monthlyLimit !== undefined
        ? { monthlyLimit: data.monthlyLimit }
        : data.limit !== undefined
        ? { monthlyLimit: data.limit }
        : {}),
      ...(data.limit !== undefined
        ? { limit: data.limit }
        : data.monthlyLimit !== undefined
        ? { limit: data.monthlyLimit }
        : {}),
      ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
    }),
  });

  return {
    ...cat,
    id: String(cat.id),
    limit:
      cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : null,
    monthlyLimit:
      cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
        ? Number(cat.monthlyLimit)
        : cat.limit !== undefined && cat.limit !== null
        ? Number(cat.limit)
        : null,
    spent: cat.spent !== undefined && cat.spent !== null ? Number(cat.spent) : 0,
    transactionCount: cat.transactionCount ?? 0,
  };
}

/**
 * Delete a category
 * DELETE /categories/:id
 */
export async function deleteCategoryApi(
  id: string,
  token: string
): Promise<void> {
  await apiClient<void>(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}
