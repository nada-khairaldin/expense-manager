export type BudgetThresholdStatus =
  | "within_limit"
  | "approaching_limit"
  | "critical"
  | "exceeded"
  | "no_limit";

export type WarningLevel = "normal" | "warning" | "danger" | "none";

export interface DashboardBudget {
  id: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  consumptionPercentage: number;
  isOverBudget: boolean;
  status: BudgetThresholdStatus;
  level: WarningLevel;
  color: "green" | "yellow" | "red" | "gray";
  warningMessage?: string;
}

export interface DashboardCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
  status: BudgetThresholdStatus;
  level: WarningLevel;
  colorStatus: "green" | "yellow" | "red" | "gray";
  warningMessage?: string;
  transactionCount: number;
}

export interface DashboardDailySpendingPoint {
  dayLabel: string;
  fullDate: string;
  amount: number;
  count: number;
}

export interface DashboardExpenseItem {
  id: string;
  amount: number;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  description: string | null;
  date: string;
  expenseDate: string;
}

export interface DashboardCycleMeta {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface DashboardData {
  isSetupNeeded: boolean;
  currency: string;
  selectedPeriod: "current" | "previous";
  periodLabel: string;
  periodDateRange: string;
  budget: DashboardBudget | null;
  categories: DashboardCategory[];
  dailySpending: DashboardDailySpendingPoint[];
  recentExpenses: DashboardExpenseItem[];
  availableCycles: {
    current: DashboardCycleMeta | null;
    previous: DashboardCycleMeta | null;
  };
}

// Backward-compatibility aliases
export type ExpenseItem = DashboardExpenseItem;
export type CategoryBudget = DashboardCategory;
export type DailySpendingPoint = DashboardDailySpendingPoint;
