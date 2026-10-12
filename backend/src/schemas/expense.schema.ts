import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.number().int().positive(),
  description: z.string().trim().max(800).optional(),
  date: z.coerce.date(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export type UpdateExpenseInput = z.infer<
  typeof updateExpenseSchema
>;


const parseQueryNumber = (value: unknown): unknown => {
  if (value === undefined) return undefined;

  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
};

const parseQueryDate = (value: unknown): unknown => {
  if (value === undefined) return undefined;

  if (typeof value !== "string" || value.trim() === "") {
    return new Date("");
  }

  const text = value.trim();
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const date = new Date(text);

  if (
    Number.isNaN(date.getTime()) ||
    (isDateOnly && date.toISOString().slice(0, 10) !== text)
  ) {
    return new Date("");
  }

  return date;
};

const parseEndDate = (value: unknown): unknown => {
  const parsed = parseQueryDate(value);

  if (
    parsed instanceof Date &&
    !Number.isNaN(parsed.getTime()) &&
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
  ) {
    parsed.setUTCHours(23, 59, 59, 999);
  }

  return parsed;
};


export const expenseQuerySchema = z
  .object({
    categoryId: z.preprocess(
      parseQueryNumber,
      z.number().int().positive().optional(),
    ),

  startDate: z.preprocess(
    parseQueryDate,
    z.date().optional(),
  ),

  endDate: z.preprocess(
    parseEndDate,
    z.date().optional(),
  ),


    minAmount: z.preprocess(
      parseQueryNumber,
      z.number().finite().min(0).optional(),
    ),

    maxAmount: z.preprocess(
      parseQueryNumber,
      z.number().finite().min(0).optional(),
    ),

    sortBy: z.enum(["date", "amount"]).optional(),

    order: z.enum(["asc", "desc"]).optional(),

    page: z.preprocess(
      parseQueryNumber,
      z.number().int().min(1).default(1),
    ),

    limit: z.preprocess(
      parseQueryNumber,
      z.number().int().min(1).max(100).default(10),
    ),
  })
  .superRefine((filters, ctx) => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "startDate must be before or equal to endDate",
      });
    }

    if (
      filters.minAmount !== undefined &&
      filters.maxAmount !== undefined &&
      filters.minAmount > filters.maxAmount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minAmount"],
        message: "minAmount cannot exceed maxAmount",
      });
    }
  });

export type ExpenseFilters = z.infer<typeof expenseQuerySchema>;
