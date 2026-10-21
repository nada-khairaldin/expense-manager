import { apiClient } from "@/lib/api/client";
import type { DashboardData } from "./types";

export async function getDashboardDataApi(
  token: string | null,
  period: "current" | "previous" = "current",
): Promise<DashboardData> {
  return apiClient<DashboardData>("/dashboard", {
    token,
    params: { period },
  });
}
