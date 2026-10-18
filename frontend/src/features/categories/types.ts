export type CategoryStatus =
  | "normal" // ضمن الحد (< 85%)
  | "warning" // اقترب من الحد (85% to < 95%, or >= 95% and <= 100%)
  | "exceeded" // تجاوز الحد (> 100%)
  | "no_limit" // بدون حد إنفاق
  | "unavailable"; // غير متوفر / لم تُحسب بعد

export interface CategoryItem {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
  limit: number | null; // null if no limit configured
  spent: number | null; // null if spending data is unavailable
  transactionCount?: number;
  createdAt?: string;
}

export type SpendingLimitFilter =
  | "all" // الكل
  | "with_limit" // بحد إنفاق
  | "without_limit" // بدون حد إنفاق
  | "approaching_limit" // اقترب من الحد
  | "exceeded_limit"; // تجاوز الحد

export type CategorySortOption =
  | "name" // الاسم
  | "highest_spent" // أعلى إنفاق
  | "closest_limit"; // الأقرب إلى حد الإنفاق

export interface CategoriesSummaryData {
  totalCategories: number;
  categoriesWithLimit: number;
  categoriesApproachingLimit: number;
  categoriesExceededLimit: number;
  totalSpentWithLimit: number;
  totalConfiguredLimit: number;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  description?: string;
  limit?: number | null;
}
