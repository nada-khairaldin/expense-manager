import { z } from "zod";

export const updateCycleBudgetSchema = z.object({
  budgetAmount: z
    .number({
      message: "Budget amount must be a valid number",
    })
    .positive("Budget amount must be greater than zero")
    .max(9999999999.99, "Budget amount exceeds maximum allowed value"),
});

export type UpdateCycleBudgetInput = z.infer<typeof updateCycleBudgetSchema>;
