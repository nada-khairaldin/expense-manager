import type { Request, Response } from "express";
import {
  getCurrentBudgetCycle,
  updateCurrentCycleBudget,
  updateCycleBudgetById,
} from "../services/budget-cycle.service.js";
import { AppError } from "../errors/app-error.js";
import type { UpdateCycleBudgetInput } from "../schemas/budget-cycle.schema.js";

export async function getCurrentBudgetCycleController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const cycle = await getCurrentBudgetCycle(req.user.id);
  res.status(200).json(cycle);
}

export async function updateCurrentCycleBudgetController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const input = req.body as UpdateCycleBudgetInput;
  const updatedCycle = await updateCurrentCycleBudget(req.user.id, input.budgetAmount);

  res.status(200).json(updatedCycle);
}

export async function updateCycleBudgetByIdController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const idParam = req.params.id;
  const cycleId = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!cycleId || typeof cycleId !== "string") {
    throw new AppError(400, "Cycle ID is required");
  }

  const input = req.body as UpdateCycleBudgetInput;
  const updatedCycle = await updateCycleBudgetById(req.user.id, cycleId, input.budgetAmount);

  res.status(200).json(updatedCycle);
}
