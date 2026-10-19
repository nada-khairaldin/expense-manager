export type BudgetStatusLevel = "excellent" | "warning" | "danger";

export interface ExpenseItem {
  id: number;
  amount: number;
  description: string;
  date: string; // ISO date string: YYYY-MM-DD
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export interface CategoryBudget {
  id: number;
  name: string;
  icon: string;
  color: string;
  spent: number;
  limit: number | null; // null if no limit configured
  percentage: number | null;
  status: "normal" | "warning" | "exceeded";
}

export interface DailySpendingPoint {
  dayLabel: string;
  fullDate: string;
  amount: number;
}

export interface PeriodData {
  id: "current" | "previous";
  label: string;
  periodDateRange: string;
  isDemo: true;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  budgetStatusText: string;
  budgetStatusLevel: BudgetStatusLevel;
  budgetNotes: string;
  dailySpending: DailySpendingPoint[];
  categories: CategoryBudget[];
  recentExpenses: ExpenseItem[];
}
