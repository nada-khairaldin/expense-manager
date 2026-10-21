"use client";

import React from "react";
import { Filter, X, ArrowUpDown, Tag } from "lucide-react";
import { useCategories } from "@/features/categories/useCategories";

interface ReportFiltersToolbarProps {
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount";
  order?: "asc" | "desc";
  onFilterChange: (filters: {
    categoryId?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: "date" | "amount";
    order?: "asc" | "desc";
  }) => void;
  onClearFilters: () => void;
}

export function ReportFiltersToolbar({
  categoryId,
  minAmount,
  maxAmount,
  sortBy = "date",
  order = "desc",
  onFilterChange,
  onClearFilters,
}: ReportFiltersToolbarProps) {
  const { categories = [] } = useCategories();

  const hasActiveFilters = Boolean(
    categoryId ||
      minAmount !== undefined ||
      maxAmount !== undefined ||
      sortBy !== "date" ||
      order !== "desc",
  );

  return (
    <div className="p-3.5 rounded-2xl border border-border bg-surface/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-teal" />
          <span className="text-xs font-bold text-text-primary">
            تصفية وفرز البيانات
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger-600 dark:text-danger-400 hover:underline min-h-[32px] px-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-secondary block">
            التصنيف:
          </label>
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              onFilterChange({ categoryId: e.target.value ? e.target.value : undefined })
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
          >
            <option value="">جميع التصنيفات</option>
            <option value="uncategorized">بدون تصنيف (غير مصنف)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-secondary block">
            الحد الأدنى للمبلغ:
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="مثال: 50"
            value={minAmount ?? ""}
            onChange={(e) =>
              onFilterChange({
                minAmount: e.target.value !== "" ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
          />
        </div>

        {/* Max Amount */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-secondary block">
            الحد الأقصى للمبلغ:
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="مثال: 500"
            value={maxAmount ?? ""}
            onChange={(e) =>
              onFilterChange({
                maxAmount: e.target.value !== "" ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
          />
        </div>

        {/* Sorting */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-secondary block">
            الترتيب حسب:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={sortBy}
              onChange={(e) =>
                onFilterChange({ sortBy: e.target.value as "date" | "amount" })
              }
              className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
            >
              <option value="date">التاريخ</option>
              <option value="amount">المبلغ</option>
            </select>

            <select
              value={order}
              onChange={(e) =>
                onFilterChange({ order: e.target.value as "asc" | "desc" })
              }
              className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
            >
              <option value="desc">تنازلي (الأعلى/الأحدث)</option>
              <option value="asc">تصاعدي (الأقل/الأقدم)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
