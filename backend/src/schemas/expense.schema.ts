import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.number().int().positive(),
  description: z.string().trim().max(800).optional(),
  date: z.coerce.date(),
});