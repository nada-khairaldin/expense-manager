"use client";

import * as React from "react";
import type { ExpenseFilters } from "../types";
import { useCategories } from "@/features/categories/useCategories";
import {
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  Layers,
  Search,
} from "lucide-react";

export interface ExpensesToolbarProps {
  filters: ExpenseFilters;
  onFilterChange: (newFilters: Partial<ExpenseFilters>) => void;
  onClearFilters: () => void;
}

export function ExpensesToolbar({
  filters,
  onFilterChange,
  onClearFilters,
}: ExpensesToolbarProps) {
  const { categories } = useCategories();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Compute active filters count
  const activeCount = [
    Boolean(filters.categoryId),
    Boolean(filters.startDate),
    Boolean(filters.endDate),
    filters.minAmount !== undefined,
    filters.maxAmount !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Top Bar: Quick presets, Sort, Mobile Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={`${filters.sortBy || "date"}_${filters.order || "desc"}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split("_") as [
                  "date" | "amount",
                  "asc" | "desc"
                ];
                onFilterChange({ sortBy, order, page: 1 });
              }}
              className="min-h-[40px] ps-8 pe-3 rounded-xl border border-border bg-surface text-xs font-semibold text-text-primary hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all appearance-none cursor-pointer"
            >
              <option value="date_desc">الأحدث تاريخاً أولاً</option>
              <option value="date_asc">الأقدم تاريخاً أولاً</option>
              <option value="amount_desc">الأعلى مبلغاً أولاً</option>
              <option value="amount_asc">الأقل مبلغاً أولاً</option>
            </select>
            <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-brand-teal">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Category quick filter (desktop / tablet) */}
          <div className="hidden sm:block relative">
            <select
              value={filters.categoryId || ""}
              onChange={(e) =>
                onFilterChange({
                  categoryId: e.target.value || undefined,
                  page: 1,
                })
              }
              className="min-h-[40px] ps-8 pe-3 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all appearance-none cursor-pointer"
            >
              <option value="">جميع التصنيفات</option>
              <option value="uncategorized">بدون تصنيف (غير مصنف)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-brand-teal">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle Button + Clear All */}
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="min-h-[40px] px-3 rounded-xl border border-border bg-surface text-xs font-medium text-text-secondary hover:text-status-danger hover:bg-status-danger-bg transition-colors inline-flex items-center gap-1.5 touch-manipulation"
              title="إعادة ضبط الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مسح الفلاتر</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
            className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-2 touch-manipulation ${
              activeCount > 0
                ? "border-brand-teal bg-brand-teal text-white shadow-sm"
                : "border-border bg-surface text-text-primary hover:bg-surface-muted"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>تصفية متقدمة</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-brand-teal text-[11px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filter Collapsible Section (for mobile and detailed filtering) */}
      {isMobileFiltersOpen && (
        <div className="p-4 rounded-2xl border border-border bg-surface-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Filter className="w-4 h-4 text-brand-teal" />
              <span>خيارات التصفية المتقدمة</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Category Filter (Mobile & Full) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text-secondary">
                التصنيف
              </label>
              <select
                value={filters.categoryId || ""}
                onChange={(e) =>
                  onFilterChange({
                    categoryId: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal"
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

            {/* 2. Start Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text-secondary">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  onFilterChange({
                    startDate: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            {/* 3. End Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text-secondary">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  onFilterChange({
                    endDate: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            {/* 4. Min & Max Amount */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text-secondary">
                نطاق المبلغ (₪)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="من"
                  min="0"
                  step="any"
                  value={filters.minAmount !== undefined ? filters.minAmount : ""}
                  onChange={(e) =>
                    onFilterChange({
                      minAmount: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                  className="w-full min-h-[42px] px-2.5 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
                <span className="text-text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="إلى"
                  min="0"
                  step="any"
                  value={filters.maxAmount !== undefined ? filters.maxAmount : ""}
                  onChange={(e) =>
                    onFilterChange({
                      maxAmount: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                  className="w-full min-h-[42px] px-2.5 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-text-muted">الفلاتر المطبقة:</span>

          {filters.categoryId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal text-xs font-semibold">
              <span>
                {filters.categoryId === "uncategorized"
                  ? "غير مصنف"
                  : categories.find((c) => c.id === filters.categoryId)?.name ||
                    "تصنيف محدد"}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.startDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal text-xs font-semibold">
              <span>من: {filters.startDate}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ startDate: undefined, page: 1 })}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.endDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal text-xs font-semibold">
              <span>إلى: {filters.endDate}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ endDate: undefined, page: 1 })}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal text-xs font-semibold">
              <span>
                المبلغ: {filters.minAmount ?? 0} ₪ — {filters.maxAmount ?? "∞"} ₪
              </span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({
                    minAmount: undefined,
                    maxAmount: undefined,
                    page: 1,
                  })
                }
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
