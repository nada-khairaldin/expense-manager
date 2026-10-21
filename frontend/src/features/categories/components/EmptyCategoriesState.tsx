"use client";

import * as React from "react";
import { FolderPlus, SearchX, Plus, RotateCcw, AlertTriangle, RefreshCw } from "lucide-react";

export interface EmptyCategoriesStateProps {
  type: "no_categories" | "no_search_results" | "error";
  searchQuery?: string;
  errorMessage?: string;
  onOpenAddCategory?: () => void;
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export function EmptyCategoriesState({
  type,
  searchQuery,
  errorMessage,
  onOpenAddCategory,
  onClearFilters,
  onRetry,
}: EmptyCategoriesStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-dashed border-status-danger/40 bg-status-danger-bg/20">
        <div className="w-14 h-14 rounded-2xl bg-status-danger/10 flex items-center justify-center text-status-danger mb-3.5 shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-status-danger">
          تعذر تحميل التصنيفات
        </h3>
        <p className="text-xs text-text-secondary max-w-md mt-1.5 mb-6 leading-relaxed">
          {errorMessage || "حدث خطأ أثناء جلب التصنيفات من الخادم. يرجى التحقق من الاتصال والمحاولة مجددًا."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
        )}
      </div>
    );
  }

  if (type === "no_search_results") {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-surface-muted/30">
        <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted mb-3 shadow-xs">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-brand-primary dark:text-foreground">
          ما لقينا تصنيفات مطابقة
        </h3>
        <p className="text-xs text-text-secondary max-w-sm mt-1 mb-5 leading-relaxed">
          {searchQuery ? (
            <>
              لا توجد تصنيفات تطابق البحث عن &quot;<strong className="text-text-primary">{searchQuery}</strong>&quot; أو الفلاتر المحددة حاليًا.
            </>
          ) : (
            "لا توجد تصنيفات تنطبق عليها شروط التصفية المحددة."
          )}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح الفلاتر والبحث</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-dashed border-border bg-surface-muted/30">
      <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-3.5 shadow-xs">
        <FolderPlus className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-brand-primary dark:text-foreground">
        لم يتم إضافة أي تصنيفات بعد
      </h3>
      <p className="text-xs text-text-secondary max-w-md mt-1.5 mb-6 leading-relaxed">
        ابدئي بإضافة تصنيفات لتنظيم مصروفاتك ومتابعة حدود الإنفاق.
      </p>
      {onOpenAddCategory && (
        <button
          type="button"
          onClick={onOpenAddCategory}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أول تصنيف</span>
        </button>
      )}
    </div>
  );
}
