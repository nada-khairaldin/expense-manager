export type BudgetThresholdStatus =
  | "within_limit"
  | "approaching_limit"
  | "critical"
  | "exceeded"
  | "no_limit";

export type WarningLevel = "normal" | "warning" | "danger" | "none";

export interface ThresholdEvaluation {
  percentage: number | null;
  remaining: number | null;
  status: BudgetThresholdStatus;
  level: WarningLevel;
  color: "green" | "yellow" | "red" | "gray";
  isOverLimit: boolean;
  message?: string | undefined;
}

/**
 * Centralized financial threshold evaluation according to Masroofi rules:
 * - < 85%: Within limit (Green, no warning)
 * - 85% to < 95%: Approaching limit (Yellow, caution)
 * - 95% or more (and < 100%): Critical (Red, prominent warning)
 * - >= 100%: Exceeded (Red, over-limit threshold)
 *
 * Uses unrounded values for comparison; rounded values for display.
 */
export function evaluateThreshold(
  spent: number,
  limit: number | null | undefined,
  entityName = "الميزانية",
  currencySymbol = "₪",
): ThresholdEvaluation {
  if (limit === null || limit === undefined || limit <= 0) {
    return {
      percentage: null,
      remaining: null,
      status: "no_limit",
      level: "none",
      color: "gray",
      isOverLimit: false,
    };
  }

  // Exact unrounded percentage for comparison
  const rawPercentage = (spent / limit) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10;
  const remaining = Math.round((limit - spent) * 100) / 100;

  if (rawPercentage >= 100) {
    const exceededAmount = Math.abs(remaining);
    return {
      percentage,
      remaining,
      status: "exceeded",
      level: "danger",
      color: "red",
      isOverLimit: true,
      message: `تم تجاوز ${entityName} بمقدار ${currencySymbol} ${exceededAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    };
  }

  if (rawPercentage >= 95) {
    return {
      percentage,
      remaining,
      status: "critical",
      level: "danger",
      color: "red",
      isOverLimit: false,
      message: `استهلكت ${percentage}% من ${entityName}، والمتبقي ${currencySymbol} ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} فقط (وضع حرج).`,
    };
  }

  if (rawPercentage >= 85) {
    return {
      percentage,
      remaining,
      status: "approaching_limit",
      level: "warning",
      color: "yellow",
      isOverLimit: false,
      message: `استهلكت ${percentage}% من ${entityName}، والمتبقي ${currencySymbol} ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} (قريب من السقف).`,
    };
  }

  return {
    percentage,
    remaining,
    status: "within_limit",
    level: "normal",
    color: "green",
    isOverLimit: false,
  };
}
