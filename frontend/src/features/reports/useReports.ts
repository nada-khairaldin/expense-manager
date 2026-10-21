"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { getFinancialReport, getReportBudgetCycles } from "./api";
import type { FinancialReport, ReportQueryParams, BudgetCyclesListResponse } from "./types";

export function useFinancialReport(params: ReportQueryParams = {}) {
  const { token, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = [
    "reports",
    token,
    params.period ?? "current_cycle",
    params.cycleId,
    params.startDate,
    params.endDate,
    params.categoryId,
    params.minAmount,
    params.maxAmount,
    params.sortBy,
    params.order,
  ];

  const query = useQuery<FinancialReport, Error>({
    queryKey,
    queryFn: () => {
      if (!token) throw new Error("يرجى تسجيل الدخول لعرض التقارير");
      return getFinancialReport(token, params);
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const invalidateReports = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };

  return {
    ...query,
    isAuthLoading,
    invalidateReports,
  };
}

export function useReportBudgetCycles() {
  const { token, isLoading: isAuthLoading } = useAuth();

  const queryKey = ["report-budget-cycles", token];

  return useQuery<BudgetCyclesListResponse, Error>({
    queryKey,
    queryFn: () => {
      if (!token) throw new Error("يرجى تسجيل الدخول");
      return getReportBudgetCycles(token);
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
