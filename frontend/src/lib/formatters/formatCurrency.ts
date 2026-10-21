import { defaultCurrency, getCurrencyConfig, type CurrencyConfig } from "@/config/currency";

export interface FormatCurrencyOptions {
  /** Override default currency configuration */
  currency?: CurrencyConfig;
  /** Currency code (e.g., 'ILS', 'USD', 'JOD', 'EUR') */
  currencyCode?: string | null;
  /** Whether to show a plus sign for positive numbers */
  showPositiveSign?: boolean;
  /** Custom decimal places (default is currency config's fractionDigits, typically 2) */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Centralized currency formatter using Intl.NumberFormat.
 * Standard output example: "₪ 1,250.00" or "-₪ 350.50".
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const cfg =
    options.currency ??
    (options.currencyCode
      ? (typeof getCurrencyConfig === "function" ? getCurrencyConfig(options.currencyCode) : defaultCurrency)
      : defaultCurrency);
  const isNegative = amount < 0;
  const absoluteValue = Math.abs(amount);

  const minDigits = options.minimumFractionDigits ?? cfg.fractionDigits;
  const maxDigits = options.maximumFractionDigits ?? cfg.fractionDigits;

  // We format the numeric part using standard western Arabic digits (0-9)
  // for high scanability in financial spreadsheets/dashboards
  const numberFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  const formattedNumber = numberFormatter.format(absoluteValue);

  // Consistent format with currency symbol
  let result = cfg.symbolPosition === "end"
    ? `${formattedNumber} ${cfg.symbol}`
    : `${cfg.symbol} ${formattedNumber}`;

  if (isNegative) {
    result = `-${result}`;
  } else if (options.showPositiveSign && amount > 0) {
    result = `+${result}`;
  }

  return result;
}
