import { z } from "zod";

const parseQueryString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value.trim();
};

const parseQueryNumber = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;
  return Number(value);
};

const parseQueryDate = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") return new Date("");

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

export const reportPeriodEnum = z.enum([
  "today",
  "this_week",
  "this_month",
  "current_cycle",
  "cycle",
  "custom",
]);

export type ReportPeriod = z.infer<typeof reportPeriodEnum>;

export const reportQuerySchema = z
  .object({
    period: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() : "current_cycle"),
      reportPeriodEnum.default("current_cycle"),
    ),

    cycleId: z.preprocess(parseQueryString, z.string().min(1).optional()),

    startDate: z.preprocess(parseQueryDate, z.date().optional()),

    endDate: z.preprocess(parseQueryDate, z.date().optional()),

    categoryId: z.preprocess(parseQueryString, z.string().min(1).optional()),

    minAmount: z.preprocess(
      parseQueryNumber,
      z.number().finite().min(0, "minAmount must be non-negative").optional(),
    ),

    maxAmount: z.preprocess(
      parseQueryNumber,
      z.number().finite().min(0, "maxAmount must be non-negative").optional(),
    ),

    sortBy: z.enum(["date", "amount"]).default("date"),

    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .superRefine((data, ctx) => {
    // If period is custom, both startDate and endDate must be provided
    if (data.period === "custom") {
      if (!data.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "startDate is required when period is custom",
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "endDate is required when period is custom",
        });
      }
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "startDate must be before or equal to endDate",
        });
      }
    }

    // If period is cycle, cycleId must be provided
    if (data.period === "cycle" && !data.cycleId) {
      ctx.addIssue({
        code: "custom",
        path: ["cycleId"],
        message: "cycleId is required when period is cycle",
      });
    }

    // Validate minAmount <= maxAmount
    if (
      data.minAmount !== undefined &&
      data.maxAmount !== undefined &&
      data.minAmount > data.maxAmount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minAmount"],
        message: "minAmount cannot exceed maxAmount",
      });
    }
  });

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
