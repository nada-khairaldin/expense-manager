"use client";

import * as React from "react";
import type { Expense } from "../types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { Edit2, Trash2, Calendar, FileText } from "lucide-react";

export interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-surface hover:border-brand-teal/40 dark:hover:border-brand-teal/30 hover:shadow-md transition-all gap-3.5">
      {/* Left side: Category icon + details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <CategoryIcon
          iconName={expense.categoryIcon || "Receipt"}
          color={expense.categoryColor || "#16856B"}
          size="md"
        />

        <div className="min-w-0 flex-1 space-y-1">
          {/* Category name & date */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${expense.categoryColor || "#16856B"}15`,
                color: expense.categoryColor || "#16856B",
              }}
            >
              {expense.categoryName}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
              <Calendar className="w-3 h-3 text-text-muted/70" />
              <span>{formatDate(expense.expenseDate || expense.date)}</span>
            </span>
          </div>

          {/* Description */}
          {expense.description ? (
            <p className="text-xs text-text-secondary leading-relaxed break-words font-medium">
              {expense.description}
            </p>
          ) : (
            <p className="text-[11px] text-text-muted italic flex items-center gap-1">
              <FileText className="w-3 h-3 opacity-50" />
              <span>بدون وصف</span>
            </p>
          )}
        </div>
      </div>

      {/* Right side: Amount + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
        {/* Prominent Amount */}
        <div className="text-start sm:text-end">
          <span className="text-base sm:text-lg font-black text-brand-primary dark:text-foreground tracking-tight">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        {/* Action buttons (min touch target 44px) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            aria-label={`تعديل مصروف ${expense.categoryName}`}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-text-secondary hover:text-brand-teal hover:bg-brand-teal/10 active:scale-95 transition-all flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            title="تعديل المصروف"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(expense)}
            aria-label={`حذف مصروف ${expense.categoryName}`}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-text-secondary hover:text-status-danger hover:bg-status-danger-bg active:scale-95 transition-all flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
            title="حذف المصروف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
