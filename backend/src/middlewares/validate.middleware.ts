import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });

      return;
    }

    req.body = result.data;

    next();
  };
}