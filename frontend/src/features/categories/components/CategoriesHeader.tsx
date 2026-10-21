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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary dark:text-foreground">
            التصنيفات
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-foreground font-bold">
            {totalCategories} تصنيف
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          تنظيم المصروفات ومراقبة حدود الإنفاق وسقوف الميزانية لكل تصنيف
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
        {onResetDemoData && (
          <button
            type="button"
            onClick={onResetDemoData}
            className="h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            title="استعادة البيانات التجريبية الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddCategory}
          id="add-category-btn"
          className="flex-1 sm:flex-initial h-11 sm:h-10 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-brand-primary text-white text-xs sm:text-sm font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف</span>
        </button>
      </div>
    </div>
  );
}
