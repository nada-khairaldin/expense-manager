import type { Request, Response } from "express";
import {
  getUserSettings,
  updateBudgetSetup,
  updateDefaultBudget,
} from "../services/settings.service.js";
import { AppError } from "../errors/app-error.js";
import type {
  BudgetSetupInput,
  UpdateDefaultBudgetInput,
} from "../schemas/settings.schema.js";

export async function getSettingsController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const settings = await getUserSettings(req.user.id);
  res.status(200).json(settings);
}

export async function updateBudgetSetupController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const input = req.body as BudgetSetupInput;
  const updated = await updateBudgetSetup(req.user.id, input);

  res.status(200).json(updated);
}

export async function updateDefaultBudgetController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const input = req.body as UpdateDefaultBudgetInput;
  const updated = await updateDefaultBudget(req.user.id, input.defaultBudgetAmount);

  res.status(200).json(updated);
}
