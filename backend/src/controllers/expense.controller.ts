import type { Request, Response } from "express";
import {
  fetchExpenses,
  fetchExpenseById,
  addExpense,
  removeExpense,
  updateExpense,
} from "../services/expense.service.js";
import { AppError } from "../errors/app-error.js";
import {
  expenseQuerySchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "../schemas/expense.schema.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required");
  }
  return req.user.id;
}

function getExpenseIdParam(req: Request): string {
  const id = req.params.id;
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new AppError(400, "Invalid expense ID");
  }
  return id.trim();
}

export async function getExpenses(req: Request, res: Response) {
  const userId = getUserId(req);
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

  const expenses = await fetchExpenses(userId, result.data);
  res.json(expenses);
}

export async function getExpenseById(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getExpenseIdParam(req);

  const expense = await fetchExpenseById(userId, id);

  if (!expense) {
    throw new AppError(404, "Expense not found");
  }

  res.json(expense);
}

export async function createExpense(req: Request, res: Response) {
  const userId = getUserId(req);
  const input = req.body as CreateExpenseInput;
  const expense = await addExpense(userId, input);

  res.status(201).json(expense);
}

export async function editExpense(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getExpenseIdParam(req);
  const input = req.body as UpdateExpenseInput;

  const expense = await updateExpense(userId, id, input);

  if (!expense) {
    throw new AppError(404, "Expense not found");
  }

  res.json(expense);
}

export async function deleteExpense(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getExpenseIdParam(req);

  const deleted = await removeExpense(userId, id);

  if (!deleted) {
    throw new AppError(404, "Expense not found");
  }

  res.status(204).send();
}