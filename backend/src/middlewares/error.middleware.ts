import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
}
