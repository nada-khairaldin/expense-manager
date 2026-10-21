import { apiClient } from "@/lib/api/client";
import type {
  Expense,
  ExpensesResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseFilters,
} from "./types";

/**
 * Fetch expenses for the authenticated user with filters, sorting, and pagination.
 * GET /expenses
 */
export async function getExpensesApi(
  token: string,
  filters: ExpenseFilters = {}
): Promise<ExpensesResponse> {
  const params: Record<string, string | number | boolean | undefined> = {};

  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.budgetCycleId) params.budgetCycleId = filters.budgetCycleId;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.minAmount !== undefined && filters.minAmount !== null) {
    params.minAmount = filters.minAmount;
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
    params.maxAmount = filters.maxAmount;
  }
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.order) params.order = filters.order;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await apiClient<{
    data: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    totalAmount?: number;
  }>("/expenses", {
    method: "GET",
    token,
    params,
  });

  const formattedData: Expense[] = Array.isArray(res.data)
    ? res.data.map((item) => ({
        ...item,
        id: String(item.id),
        amount: Number(item.amount),
        categoryId: item.categoryId ? String(item.categoryId) : null,
        categoryName: item.categoryName || "غير مصنف",
        categoryIcon: item.categoryIcon || null,
        categoryColor: item.categoryColor || null,
        description: item.description || null,
      }))
    : [];

  return {
    data: formattedData,
    pagination: {
      page: res.pagination?.page ?? 1,
      limit: res.pagination?.limit ?? 10,
      total: res.pagination?.total ?? 0,
      totalPages: res.pagination?.totalPages ?? 1,
    },
    totalAmount: typeof res.totalAmount === "number" ? res.totalAmount : 0,
  };
}

/**
 * Fetch a single expense by ID
 * GET /expenses/:id
 */
export async function getExpenseByIdApi(
  id: string,
  token: string
): Promise<Expense> {
  const item = await apiClient<Expense>(`/expenses/${id}`, {
    method: "GET",
    token,
  });

  return {
    ...item,
    id: String(item.id),
    amount: Number(item.amount),
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryName: item.categoryName || "غير مصنف",
    categoryIcon: item.categoryIcon || null,
    categoryColor: item.categoryColor || null,
    description: item.description || null,
  };
}

/**
 * Create a new expense
 * POST /expenses
 */
export async function createExpenseApi(
  payload: CreateExpensePayload,
  token: string
): Promise<Expense> {
  const item = await apiClient<Expense>("/expenses", {
    method: "POST",
    token,
    body: JSON.stringify({
      amount: payload.amount,
      categoryId: payload.categoryId || null,
      description: payload.description ? payload.description.trim() : null,
      date: payload.date,
    }),
  });

  return {
    ...item,
    id: String(item.id),
    amount: Number(item.amount),
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryName: item.categoryName || "غير مصنف",
    categoryIcon: item.categoryIcon || null,
    categoryColor: item.categoryColor || null,
    description: item.description || null,
  };
}

/**
 * Update an existing expense
 * PATCH /expenses/:id
 */
export async function updateExpenseApi(
  id: string,
  payload: UpdateExpensePayload,
  token: string
): Promise<Expense> {
  const body: Record<string, unknown> = {};

  if (payload.amount !== undefined) body.amount = payload.amount;
  if (payload.categoryId !== undefined) body.categoryId = payload.categoryId;
  if (payload.description !== undefined) {
    body.description = payload.description ? payload.description.trim() : null;
  }
  if (payload.date !== undefined) body.date = payload.date;

  const item = await apiClient<Expense>(`/expenses/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });

  return {
    ...item,
    id: String(item.id),
    amount: Number(item.amount),
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryName: item.categoryName || "غير مصنف",
    categoryIcon: item.categoryIcon || null,
    categoryColor: item.categoryColor || null,
    description: item.description || null,
  };
}

/**
 * Delete an expense
 * DELETE /expenses/:id
 */
export async function deleteExpenseApi(
  id: string,
  token: string
): Promise<void> {
  await apiClient<void>(`/expenses/${id}`, {
    method: "DELETE",
    token,
  });
}
