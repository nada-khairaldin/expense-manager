"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { CategoryItem } from "../types";
import { CategoryIcon } from "./CategoryIcon";
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";

export interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  onConfirmDelete: (categoryId: number) => Promise<void> | void;
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
  onConfirmDelete,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!category) return null;

  const hasExpenses = (category.transactionCount ?? 0) > 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(category.id);
      onClose();
    } catch {
      // handled
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف التصنيف؟"
      description="يرجى مراجعة تفاصيل ونتائج إجراء حذف هذا التصنيف بعناية."
      className="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Category Card Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-muted/40">
          <CategoryIcon iconName={category.icon} color={category.color} size="md" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary">{category.name}</div>
            <div className="text-[11px] text-text-muted">
              {hasExpenses
                ? `مرتبط بـ ${category.transactionCount} عملية مالية مسجلة`
                : "لا توجد عمليات مرتبطة بهذا التصنيف"}
            </div>
          </div>
        </div>

        {/* Primary Product Warning Message (As specified in Phase 3 rules) */}
        <div className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning-bg/50 text-xs text-text-primary space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-status-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تنبيه هام حول العمليات السابقة:</span>
          </div>
          <p className="text-text-secondary leading-relaxed">
            لن يعود هذا التصنيف متاحًا للاختيار عند تسجيل مصروف جديد. يجب أن تبقى المصروفات السابقة محفوظة مع الاحتفاظ باسم التصنيف الذي سُجّل معها.
          </p>
        </div>

        {/* Historical integrity guarantee note */}
        <div className="flex items-start gap-2 text-[11px] text-text-muted px-1">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
          <span>
            سلامة البيانات: لن يتم حذف أي مبالغ أو فواتير سابقة لحماية دقة التقارير وحسابات الميزانية الإجمالية.
          </span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-medium transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-status-danger text-white text-xs font-bold hover:bg-status-danger/90 shadow-sm transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد الحذف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
