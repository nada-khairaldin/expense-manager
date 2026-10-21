"use client";

import * as React from "react";
import { Receipt, SearchX, Plus, RotateCcw } from "lucide-react";

export interface EmptyExpensesStateProps {
  isFiltered: boolean;
  onClearFilters?: () => void;
  onAddExpense?: () => void;
}

export function EmptyExpensesState({
  isFiltered,
  onClearFilters,
  onAddExpense,
}: EmptyExpensesStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-surface-muted/30 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center">
          <SearchX className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text-primary">
            لا توجد مصروفات مطابقة للبحث
          </h3>
          <p className="text-xs text-text-muted max-w-sm">
            لم نجد أي حركات مالية مطابقة للفلاتر المحددة (التصنيف، النطاق الزمني، أو المبلغ).
          </p>
        </div>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text-primary hover:bg-surface-muted active:scale-95 transition-all inline-flex items-center gap-2 touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح جميع الفلاتر</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-dashed border-border bg-surface-muted/20 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
        <Receipt className="w-7 h-7" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-brand-primary dark:text-foreground">
          سجل المصروفات فارغ
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          لم تسجل أي مصروفات حتى الآن في حسابك. ابدأ بتسجيل أول حركة مصروف يومية لتتبع نفقاتك والتحكم بميزانيتك بدقة.
        </p>
      </div>
      {onAddExpense && (
        <button
          type="button"
          onClick={onAddExpense}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover active:scale-95 transition-all inline-flex items-center gap-2 shadow-sm touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أول مصروف الآن</span>
        </button>
      )}
    </div>
  );
}
