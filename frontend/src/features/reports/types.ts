export type ReportPeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "current_cycle"
  | "cycle"
  | "custom";

export interface ReportQueryParams {
  period?: ReportPeriod;
  cycleId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount";
  order?: "asc" | "desc";
}

export interface ReportSummary {
  totalSpending: number;
  expenseCount: number;
  averageExpense: number;
  minExpense: number;
  maxExpense: number;
}

export interface ReportComparison {
  previousPeriodLabel: string;
  prevStartDate: string;
  prevEndDate: string;
  previousTotalSpending: number;
  previousExpenseCount: number;
  spendingChange: number;
  percentageChange: number;
  trend: "increase" | "decrease" | "no_change";
}

export interface ReportBudgetMetrics {
  cycleId: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  expenseCount: number;
}

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
  isArchived: boolean;
  isDeleted: boolean;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  amount: number;
  count: number;
}

export interface ReportExpenseItem {
  id: string;
  amount: number;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  description: string | null;
  date: string;
  expenseDate: string;
  budgetCycleId: string;
  createdAt: string;
}

export interface FinancialReport {
  period: ReportPeriod;
  periodLabel: string;
  startDate: string;
  endDate: string;
  currency: string;
  summary: ReportSummary;
  comparison: ReportComparison;
  budgetMetrics: ReportBudgetMetrics | null;
  categoryBreakdown: CategoryBreakdownItem[];
  timeSeries: {
    interval: "day" | "week" | "month";
    data: TimeSeriesPoint[];
  };
  expenses: ReportExpenseItem[];
}

export interface ReportBudgetCycle {
  id: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  percentageUsed: number;
  isCompleted: boolean;
  isCurrent: boolean;
  expenseCount: number;
  createdAt: string;
}

export interface BudgetCyclesListResponse {
  cycles: ReportBudgetCycle[];
}
