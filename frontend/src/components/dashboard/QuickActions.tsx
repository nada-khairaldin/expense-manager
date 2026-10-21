"use client";

import Link from "next/link";
import { PlusCircle, FolderTree, BarChart3 } from "lucide-react";

export interface QuickActionsProps {
  onOpenAddExpense: () => void;
}

export function QuickActions({ onOpenAddExpense }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={onOpenAddExpense}
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-brand-teal text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-brand-teal"
      >
        <PlusCircle className="w-4 h-4" />
        <span>إضافة مصروف</span>
      </button>

      <Link
        href="/categories"
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-semibold transition-all active:scale-95 touch-manipulation"
      >
        <FolderTree className="w-4 h-4 text-brand-gold" />
        <span>التصنيفات</span>
      </Link>

      <Link
        href="/reports"
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-semibold transition-all active:scale-95 touch-manipulation"
      >
        <BarChart3 className="w-4 h-4 text-brand-primary dark:text-foreground" />
        <span>التقارير</span>
      </Link>
    </div>
  );
}
