import type { Request, Response } from "express";
import { fetchExpenses } from "../services/expense.service.js";


export function getExpenses(_req: Request, res: Response) {
    const expenses = fetchExpenses();
    res.json(expenses);
}

export function getExpenseById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const expense = fetchExpenses().find((expense) => expense.id === id);

  if (!expense) {
    res.status(404).json({
      message: "Expense not found",
    });

    return;
  }

  res.json(expense);
}


export function createExpense(req: Request, res: Response) {
    const { amount, categoryId, description, date } = req.body;
    // Here you would typically call a service to create the expense in the database    
    res.status(201).json({ message: "Expense created successfully", expense: { amount, categoryId, description, date } });
}