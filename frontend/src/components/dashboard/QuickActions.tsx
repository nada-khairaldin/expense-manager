"use client";

import Link from "next/link";
import { PlusCircle, FolderTree, BarChart3 } from "lucide-react";

export interface QuickActionsProps {
  onOpenAddExpense: () => void;
}

export function QuickActions({ onOpenAddExpense }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={onOpenAddExpense}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal"
      >
        <PlusCircle className="w-4 h-4" />
        <span>إضافة مصروف</span>
      </button>

      <Link
        href="/categories"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-medium transition-colors"
      >
        <FolderTree className="w-4 h-4 text-brand-gold" />
        <span>إدارة التصنيفات</span>
      </Link>

      <Link
        href="/reports"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-medium transition-colors"
      >
        <BarChart3 className="w-4 h-4 text-brand-primary dark:text-foreground" />
        <span>عرض التقارير</span>
      </Link>
    </div>
  );
}
