export interface CurrencyConfig {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  locale: string;
  symbolPosition: "start" | "end";
  fractionDigits: number;
}

export const defaultCurrency: CurrencyConfig = {
  code: "ILS",
  symbol: "₪",
  nameAr: "شيكل إسرائيلي جديد",
  nameEn: "Israeli New Shekel",
  locale: "ar-IL",
  symbolPosition: "start",
  fractionDigits: 2,
};
