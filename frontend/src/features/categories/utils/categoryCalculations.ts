import {
  CategoryItem,
  CategoryStatus,
  CategoriesSummaryData,
  SpendingLimitFilter,
  CategorySortOption,
} from "../types";

/**
 * Calculates spending percentage against the configured limit.
 * Returns null if limit is not configured or spending is unknown.
 * Can return values > 100 if spent exceeds the limit.
 */
export function calculateSpendingPercentage(
  spent: number | null,
  limit: number | null
): number | null {
  if (limit === null || limit === undefined || limit <= 0 || spent === null || spent === undefined) {
    return null;
  }
  return (spent / limit) * 100;
}

/**
 * Determines category spending status according to financial rules:
 * - Below 85%: normal (ضمن الحد)
 * - From 85% to 100%: warning (اقترب من الحد)
 * - Strictly greater than 100% (spent > limit): exceeded (تجاوز الحد)
 * - Without limit: no_limit (بدون حد إنفاق)
 * - Without spending data: unavailable (غير متوفر)
 */
export function getCategoryStatus(
  spent: number | null,
  limit: number | null
): CategoryStatus {
  if (spent === null || spent === undefined) {
    return "unavailable";
  }

  if (limit === null || limit === undefined || limit <= 0) {
    return "no_limit";
  }

  if (spent > limit) {
    return "exceeded";
  }

  const percentage = (spent / limit) * 100;
  if (percentage >= 85) {
    return "warning";
  }

  return "normal";
}

/**
 * Computes remaining balance or excess amount for a category.
 */
export function getCategoryRemaining(
  spent: number | null,
  limit: number | null
): { amount: number; isExceeded: boolean } | null {
  if (limit === null || limit === undefined || limit <= 0 || spent === null || spent === undefined) {
    return null;
  }

  const diff = limit - spent;
  if (diff >= 0) {
    return { amount: diff, isExceeded: false };
  } else {
    return { amount: Math.abs(diff), isExceeded: true };
  }
}

/**
 * Derives accurate summary overview metrics from the category dataset.
 * Does not invent numbers or assume unknown spending is zero.
 */
export function computeCategoriesSummary(
  categories: CategoryItem[]
): CategoriesSummaryData {
  let categoriesWithLimit = 0;
  let categoriesApproachingLimit = 0;
  let categoriesExceededLimit = 0;
  let totalSpentWithLimit = 0;
  let totalConfiguredLimit = 0;

  for (const cat of categories) {
    const hasLimit = cat.limit !== null && cat.limit !== undefined && cat.limit > 0;
    if (hasLimit) {
      categoriesWithLimit++;
      totalConfiguredLimit += cat.limit!;

      if (cat.spent !== null && cat.spent !== undefined) {
        totalSpentWithLimit += cat.spent;
        const percentage = (cat.spent / cat.limit!) * 100;

        if (percentage >= 85) {
          categoriesApproachingLimit++;
        }

        if (cat.spent > cat.limit!) {
          categoriesExceededLimit++;
        }
      }
    }
  }

  return {
    totalCategories: categories.length,
    categoriesWithLimit,
    categoriesApproachingLimit,
    categoriesExceededLimit,
    totalSpentWithLimit,
    totalConfiguredLimit,
  };
}

/**
 * Normalizes Arabic text for flexible search (ignores diacritics, alef forms, etc.).
 */
export function normalizeArabicText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

/**
 * Filters and sorts categories based on search query, filter option, and sort criteria.
 */
export function filterAndSortCategories(
  categories: CategoryItem[],
  query: string,
  filter: SpendingLimitFilter,
  sort: CategorySortOption
): CategoryItem[] {
  const normalizedQuery = normalizeArabicText(query);

  const filtered = categories.filter((cat) => {
    // 1. Text Search
    if (normalizedQuery) {
      const nameMatch = normalizeArabicText(cat.name).includes(normalizedQuery);
      const descMatch = cat.description
        ? normalizeArabicText(cat.description).includes(normalizedQuery)
        : false;
      if (!nameMatch && !descMatch) return false;
    }

    // 2. Spending Limit Filter
    const hasLimit = cat.limit !== null && cat.limit !== undefined && cat.limit > 0;
    const hasSpent = cat.spent !== null && cat.spent !== undefined;

    switch (filter) {
      case "with_limit":
        return hasLimit;
      case "without_limit":
        return !hasLimit;
      case "approaching_limit":
        if (!hasLimit || !hasSpent) return false;
        const pct = (cat.spent! / cat.limit!) * 100;
        return pct >= 85 && cat.spent! <= cat.limit!;
      case "exceeded_limit":
        if (!hasLimit || !hasSpent) return false;
        return cat.spent! > cat.limit!;
      case "all":
      default:
        return true;
    }
  });

  // 3. Sorting
  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name, "ar");

      case "highest_spent": {
        const spentA = a.spent ?? -1;
        const spentB = b.spent ?? -1;
        return spentB - spentA;
      }

      case "closest_limit": {
        const pctA = calculateSpendingPercentage(a.spent, a.limit);
        const pctB = calculateSpendingPercentage(b.spent, b.limit);

        // Put categories without percentage at the bottom
        if (pctA === null && pctB === null) return 0;
        if (pctA === null) return 1;
        if (pctB === null) return -1;

        return pctB - pctA;
      }

      default:
        return 0;
    }
  });
}
