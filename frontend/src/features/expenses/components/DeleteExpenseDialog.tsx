"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import type { Expense } from "../types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onConfirmDelete: (id: string) => Promise<unknown>;
  onSuccess?: () => void;
}

export function DeleteExpenseDialog({
  isOpen,
  onClose,
  expense,
  onConfirmDelete,
  onSuccess,
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!expense) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await onConfirmDelete(expense.id);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("فشل حذف المصروف، يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد حذف المصروف"
      description="هل أنت متأكد من رغبتك في حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء."
    >
      <div className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-status-danger-bg text-status-danger border border-status-danger/20 text-xs font-medium"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Expense Summary Preview */}
        <div className="p-4 rounded-xl border border-status-danger/20 bg-status-danger-bg/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">المبلغ:</span>
            <span className="text-sm font-bold text-status-danger">
              {formatCurrency(expense.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">التصنيف:</span>
            <span className="font-semibold text-text-primary">
              {expense.categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">التاريخ:</span>
            <span className="text-text-secondary">
              {formatDate(expense.expenseDate || expense.date)}
            </span>
          </div>

          {expense.description && (
            <div className="flex items-start justify-between pt-1 border-t border-border/40">
              <span className="text-text-muted">الوصف:</span>
              <span className="text-text-secondary text-end max-w-[200px] truncate">
                {expense.description}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-text-secondary hover:bg-surface-muted active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-status-danger text-white text-xs font-bold hover:bg-status-danger-hover active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف المصروف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
