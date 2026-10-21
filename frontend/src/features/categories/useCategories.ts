"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "./api";
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types";

export function useCategories() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["categories", token];

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError,
    error,
    refetch,
  } = useQuery<CategoryItem[], Error>({
    queryKey,
    queryFn: () => {
      if (!token) throw new Error("Authentication required");
      return getCategoriesApi(token);
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => {
      if (!token) throw new Error("Authentication required");
      return createCategoryApi(payload, token);
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<CategoryItem[]>(queryKey, (prev) => {
        if (!prev) return [newCategory];
        const filtered = prev.filter((c) => c.id !== newCategory.id);
        return [newCategory, ...filtered];
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      if (!token) throw new Error("Authentication required");
      return updateCategoryApi(id, payload, token);
    },
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<CategoryItem[]>(queryKey, (prev) => {
        if (!prev) return [updatedCategory];
        return prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c));
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("Authentication required");
      return deleteCategoryApi(id, token);
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<CategoryItem[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter((c) => c.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return {
    categories,
    isLoading: isAuthLoading || (Boolean(token) && isCategoriesLoading),
    isError,
    error: error ? error.message : null,
    refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: (id: string, payload: UpdateCategoryPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
