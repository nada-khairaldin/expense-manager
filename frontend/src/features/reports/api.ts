import { apiClient } from "@/lib/api/client";
import type {
  FinancialReport,
  ReportQueryParams,
  BudgetCyclesListResponse,
} from "./types";

export async function getFinancialReport(
  token: string | null,
  params: ReportQueryParams = {},
): Promise<FinancialReport> {
  const queryParams: Record<string, string | number | undefined> = {};

  if (params.period) queryParams.period = params.period;
  if (params.cycleId) queryParams.cycleId = params.cycleId;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  if (params.minAmount !== undefined) queryParams.minAmount = params.minAmount;
  if (params.maxAmount !== undefined) queryParams.maxAmount = params.maxAmount;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.order) queryParams.order = params.order;

  return apiClient<FinancialReport>("/reports", {
    token,
    params: queryParams,
  });
}

export async function getReportBudgetCycles(
  token: string | null,
): Promise<BudgetCyclesListResponse> {
  return apiClient<BudgetCyclesListResponse>("/reports/cycles", {
    token,
  });
}
