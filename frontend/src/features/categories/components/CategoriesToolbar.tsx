"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { SpendingLimitFilter, CategorySortOption } from "../types";
import { cn } from "@/lib/utils";

export interface CategoriesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: SpendingLimitFilter;
  onFilterChange: (filter: SpendingLimitFilter) => void;
  activeSort: CategorySortOption;
  onSortChange: (sort: CategorySortOption) => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

const FILTER_OPTIONS: { id: SpendingLimitFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "with_limit", label: "بحد إنفاق" },
  { id: "without_limit", label: "بدون حد إنفاق" },
  { id: "approaching_limit", label: "اقترب من الحد" },
  { id: "exceeded_limit", label: "تجاوز الحد" },
];

const SORT_OPTIONS: { id: CategorySortOption; label: string }[] = [
  { id: "name", label: "الاسم (أبجديًا)" },
  { id: "highest_spent", label: "أعلى إنفاق" },
  { id: "closest_limit", label: "الأقرب إلى حد الإنفاق" },
];

export function CategoriesToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: CategoriesToolbarProps) {
  const hasActiveFilters = searchQuery.trim() !== "" || activeFilter !== "all" || activeSort !== "name";

  return (
    <div className="space-y-3 p-4 rounded-2xl border border-border bg-surface text-foreground shadow-sm">
      {/* Top row: Search input + Sorting selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحثي عن تصنيف..."
            aria-label="ابحثي عن تصنيف بالاسم أو الوصف"
            className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-border bg-surface-muted/40 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-foreground rounded-lg transition-colors"
              aria-label="مسح نص البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown & Results Counter */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <label htmlFor="category-sort" className="hidden sm:inline font-medium">
              الترتيب:
            </label>
            <select
              id="category-sort"
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as CategorySortOption)}
              className="py-2 px-3 rounded-xl border border-border bg-surface-muted/40 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] font-semibold text-text-muted bg-surface-muted px-2.5 py-1 rounded-lg">
            عرض {filteredCount} من {totalCount}
          </span>
        </div>
      </div>

      {/* Bottom row: Filter Chips + Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border-subtle">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="تصفية حسب حالة حد الإنفاق">
          <span className="text-[11px] font-semibold text-text-muted me-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>الحالة:</span>
          </span>

          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal",
                  isActive
                    ? "bg-brand-primary text-white shadow-xs dark:bg-brand-teal dark:text-white"
                    : "bg-surface-muted/60 text-text-secondary hover:bg-surface-muted hover:text-foreground"
                )}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-status-warning hover:text-status-warning/80 font-semibold px-2 py-1 rounded-lg hover:bg-status-warning-bg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>مسح الفلاتر</span>
          </button>
        )}
      </div>
    </div>
  );
}
