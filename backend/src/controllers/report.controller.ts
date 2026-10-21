import type { Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { reportQuerySchema } from "../schemas/report.schema.js";
import {
  generateFinancialReport,
  fetchUserBudgetCycles,
} from "../services/report.service.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required");
  }
  return req.user.id;
}

export async function getFinancialReportController(req: Request, res: Response) {
  const userId = getUserId(req);
  const result = reportQuerySchema.safeParse(req.query);

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

  const report = await generateFinancialReport(userId, result.data);
  res.json(report);
}

export async function getReportBudgetCyclesController(req: Request, res: Response) {
  const userId = getUserId(req);
  const cycles = await fetchUserBudgetCycles(userId);
  res.json({ cycles });
}
