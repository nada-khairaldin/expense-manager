"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { getDashboardDataApi } from "./api";
import type { DashboardData } from "./types";

export function useDashboard(period: "current" | "previous" = "current") {
  const { token, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["dashboard", token, period];

  const query = useQuery<DashboardData, Error>({
    queryKey,
    queryFn: () => {
      if (!token) throw new Error("يرجى تسجيل الدخول لعرض لوحة التحكم");
      return getDashboardDataApi(token, period);
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return {
    ...query,
    isAuthLoading,
    invalidateDashboard,
  };
}
