export interface Expense {
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
  updatedAt: string;
}

export interface CreateExpensePayload {
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  date?: string; // YYYY-MM-DD
}

export interface UpdateExpensePayload {
  amount?: number;
  categoryId?: string | null;
  description?: string | null;
  date?: string; // YYYY-MM-DD
}

export interface ExpenseFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  budgetCycleId?: string;
}

export interface ExpensesResponse {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalAmount: number;
}
