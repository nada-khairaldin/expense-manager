"use client";

import * as React from "react";
import { Plus, RotateCcw } from "lucide-react";

export interface CategoriesHeaderProps {
  onOpenAddCategory: () => void;
  onResetDemoData?: () => void;
  totalCategories: number;
}

export function CategoriesHeader({
  onOpenAddCategory,
  onResetDemoData,
  totalCategories,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-primary dark:text-foreground">
            التصنيفات
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-foreground font-semibold">
            {totalCategories} تصنيف
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          نظّمي مصروفاتك وتابعي حدود الإنفاق لكل تصنيف.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {onResetDemoData && (
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
            title="استعادة البيانات التجريبية الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">استعادة الافتراضي</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddCategory}
          id="add-category-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف</span>
        </button>
      </div>
    </div>
  );
}
