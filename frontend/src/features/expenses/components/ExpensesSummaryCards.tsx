"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Receipt, Hash, Calculator } from "lucide-react";

export interface ExpensesSummaryCardsProps {
  totalAmount: number;
  totalTransactions: number;
}

export function ExpensesSummaryCards({
  totalAmount,
  totalTransactions,
}: ExpensesSummaryCardsProps) {
  const averageTransaction =
    totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {/* 1. إجمالي الإنفاق */}
      <div className="p-4 rounded-2xl border border-border bg-surface flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
          <Receipt className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-text-muted">إجمالي الإنفاق المعروض</p>
          <p className="text-base sm:text-lg font-black text-brand-primary dark:text-foreground">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      {/* 2. عدد العمليات */}
      <div className="p-4 rounded-2xl border border-border bg-surface flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
          <Hash className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-text-muted">إجمالي عدد العمليات</p>
          <p className="text-base sm:text-lg font-black text-brand-primary dark:text-foreground">
            {totalTransactions} <span className="text-xs font-normal text-text-muted">حركة</span>
          </p>
        </div>
      </div>

      {/* 3. متوسط العملية */}
      <div className="p-4 rounded-2xl border border-border bg-surface flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-text-muted">متوسط قيمة المصروف</p>
          <p className="text-base sm:text-lg font-black text-brand-primary dark:text-foreground">
            {formatCurrency(averageTransaction)}
          </p>
        </div>
      </div>
    </div>
  );
}
