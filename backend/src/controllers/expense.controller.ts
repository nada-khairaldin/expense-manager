
import type { Request, Response } from "express";
import {
  fetchExpenses,
  fetchExpenseById,
  addExpense,
  removeExpense,
  updateExpense
} from "../services/expense.service.js";
import { AppError } from "../errors/app-error.js";
import { expenseQuerySchema, type CreateExpenseInput, type UpdateExpenseInput  } from "../schemas/expense.schema.js";
import { fetchCategoryById } from "../services/category.service.js";



export function getExpenses(req: Request, res: Response) {
  const result = expenseQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw new AppError(
      400,
      result.error.issues
        .map((issue) => {
          const field = issue.path.join(".");
          return `${field}: ${issue.message}`;
        })
        .join("; "),
    );
  }

  const expenses = fetchExpenses(result.data);

  res.json(expenses);
}


export function getExpenseById(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid expense ID");
  }

  const expense = fetchExpenseById(id);

  if (!expense) {
    throw new AppError(404, "Expense not found");
  }

  res.json(expense);
}

export function createExpense(req: Request, res: Response) {
  const input = req.body as CreateExpenseInput;
  const expense = addExpense(input);

  res.status(201).json(expense);
}


export function deleteExpense(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid expense ID");
  }

  const deleted = removeExpense(id);

  if (!deleted) {
    throw new AppError(404, "Expense not found");
  }

  res.status(204).send();
}

export function editExpense(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid expense ID");
  }

  const input = req.body as UpdateExpenseInput;

  // Validate the category if the request changes it.
  if (input.categoryId !== undefined) {
    const category = fetchCategoryById(input.categoryId);

    if (!category) {
      throw new AppError(400, "Category not found");
    }
  }

  const expense = updateExpense(id, input);

  if (!expense) {
    throw new AppError(404, "Expense not found");
  }

  res.json(expense);
}