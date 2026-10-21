"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "./api";
import type {
  Expense,
  ExpensesResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseFilters,
} from "./types";

export function useExpenses(filters: ExpenseFilters = {}) {
  const { token, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = [
    "expenses",
    token,
    filters.categoryId,
    filters.budgetCycleId,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    filters.sortBy,
    filters.order,
    filters.page,
    filters.limit,
  ];

  const {
    data,
    isLoading: isExpensesLoading,
    isError,
    error,
    refetch,
  } = useQuery<ExpensesResponse, Error>({
    queryKey,
    queryFn: () => {
      if (!token) throw new Error("Authentication required");
      return getExpensesApi(token, filters);
    },
    enabled: Boolean(token),
  });

  const invalidateRelatedData = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["budget-cycle"] });
    queryClient.invalidateQueries({ queryKey: ["current-cycle"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["report-budget-cycles"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => {
      if (!token) throw new Error("Authentication required");
      return createExpenseApi(payload, token);
    },
    onSuccess: () => {
      invalidateRelatedData();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpensePayload }) => {
      if (!token) throw new Error("Authentication required");
      return updateExpenseApi(id, payload, token);
    },
    onSuccess: () => {
      invalidateRelatedData();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("Authentication required");
      return deleteExpenseApi(id, token);
    },
    onSuccess: () => {
      invalidateRelatedData();
    },
  });

  return {
    expenses: data?.data ?? [],
    pagination: data?.pagination ?? {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    totalAmount: data?.totalAmount ?? 0,
    isLoading: isAuthLoading || (Boolean(token) && isExpensesLoading),
    isError,
    error: error ? error.message : null,
    refetch,
    createExpense: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? createMutation.error.message : null,
    updateExpense: (id: string, payload: UpdateExpensePayload) =>
      updateMutation.mutateAsync({ id, payload }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? updateMutation.error.message : null,
    deleteExpense: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? deleteMutation.error.message : null,
  };
}
