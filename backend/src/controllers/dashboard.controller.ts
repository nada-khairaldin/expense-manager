import type { Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { getDashboardData } from "../services/dashboard.service.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required");
  }
  return req.user.id;
}

export async function getDashboardController(req: Request, res: Response) {
  const userId = getUserId(req);
  const periodParam = req.query.period;
  const period = periodParam === "previous" ? "previous" : "current";

  const data = await getDashboardData(userId, period);
  res.status(200).json(data);
}
