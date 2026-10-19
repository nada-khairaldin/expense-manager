import { z } from "zod";

export const SUPPORTED_CURRENCIES = ["ILS", "USD", "JOD", "EUR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const budgetSetupSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES, {
    message: "Currency must be one of: ILS, USD, JOD, EUR",
  }),
  budgetRenewalDay: z
    .number({
      message: "Budget renewal day must be a valid number",
    })
    .int("Budget renewal day must be an integer")
    .min(1, "Budget renewal day must be between 1 and 31")
    .max(31, "Budget renewal day must be between 1 and 31"),
  defaultBudgetAmount: z
    .number({
      message: "Default budget amount must be a valid number",
    })
    .positive("Default budget amount must be greater than zero")
    .max(9999999999.99, "Default budget amount exceeds maximum allowed value")
    .optional(),
});

export type BudgetSetupInput = z.infer<typeof budgetSetupSchema>;

export const updateDefaultBudgetSchema = z.object({
  defaultBudgetAmount: z
    .number({
      message: "Default budget amount must be a valid number",
    })
    .positive("Default budget amount must be greater than zero")
    .max(9999999999.99, "Default budget amount exceeds maximum allowed value"),
});

export type UpdateDefaultBudgetInput = z.infer<typeof updateDefaultBudgetSchema>;

