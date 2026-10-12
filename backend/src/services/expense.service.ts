
import type { CreateExpenseInput, UpdateExpenseInput } from "../schemas/expense.schema.js";
import type { ExpenseFilters } from "../schemas/expense.schema.js";
export type Expense = CreateExpenseInput & {
  id: number;
};


const expenses: Expense[] = [
  {
    id: 1,
    amount: 50,
    categoryId: 1,
    description: "Groceries",
    date: new Date("2026-10-01"),
  },
  {
    id: 2,
    amount: 30,
    categoryId: 2,
    description: "Education",
    date: new Date("2026-10-02"),
  },
];


export function fetchExpenses(filters: ExpenseFilters) {
  let result = [...expenses];

  if (filters.categoryId !== undefined) {
    result = result.filter(
      (expense) => expense.categoryId === filters.categoryId,
    );
  }

  if (filters.startDate) {
    result = result.filter(
      (expense) => expense.date >= filters.startDate!,
    );
  }

  if (filters.endDate) {
    result = result.filter(
      (expense) => expense.date <= filters.endDate!,
    );
  }

  if (filters.minAmount !== undefined) {
    result = result.filter(
      (expense) => expense.amount >= filters.minAmount!,
    );
  }

  if (filters.maxAmount !== undefined) {
    result = result.filter(
      (expense) => expense.amount <= filters.maxAmount!,
    );
  }

  const sortBy = filters.sortBy ?? "date";
  const order = filters.order ?? "desc";
  const direction = order === "asc" ? 1 : -1;

  result.sort((a, b) => {
    const comparison =
      sortBy === "amount"
        ? a.amount - b.amount
        : a.date.getTime() - b.date.getTime();

    return comparison * direction;
  });

  const total = result.length;
  const startIndex = (filters.page - 1) * filters.limit;
  const data = result.slice(startIndex, startIndex + filters.limit);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}


export function fetchExpenseById(
  id: number,
): Expense | undefined {
  return expenses.find((expense) => expense.id === id);
}

export function addExpense(
  input: CreateExpenseInput,
): Expense {
  const nextId =
    Math.max(0, ...expenses.map((expense) => expense.id)) + 1;

  const expense: Expense = {
    id: nextId,
    ...input,
  };

  expenses.push(expense);

  return expense;
}


export function removeExpense(id: number): boolean {
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return false;
  }

  expenses.splice(index, 1);
  return true;
}


export function updateExpense(
  id: number,
  input: UpdateExpenseInput,
): Expense | undefined {
  const expense = expenses.find((item) => item.id === id);

  if (!expense) {
    return undefined;
  }

  Object.assign(expense, input);

  return expense;
}