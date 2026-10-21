export interface CurrencyConfig {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  locale: string;
  symbolPosition: "start" | "end";
  fractionDigits: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  ILS: {
    code: "ILS",
    symbol: "₪",
    nameAr: "شيكل إسرائيلي جديد",
    nameEn: "Israeli New Shekel",
    locale: "ar-IL",
    symbolPosition: "start",
    fractionDigits: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    nameAr: "دولار أمريكي",
    nameEn: "US Dollar",
    locale: "en-US",
    symbolPosition: "start",
    fractionDigits: 2,
  },
  JOD: {
    code: "JOD",
    symbol: "د.أ",
    nameAr: "دينار أردني",
    nameEn: "Jordanian Dinar",
    locale: "ar-JO",
    symbolPosition: "end",
    fractionDigits: 3,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    nameAr: "يورو",
    nameEn: "Euro",
    locale: "de-DE",
    symbolPosition: "start",
    fractionDigits: 2,
  },
};

export const defaultCurrency: CurrencyConfig = SUPPORTED_CURRENCIES.ILS;

export function getCurrencyConfig(code?: string | null): CurrencyConfig {
  if (!code) return defaultCurrency;
  return SUPPORTED_CURRENCIES[code.toUpperCase()] ?? defaultCurrency;
}
