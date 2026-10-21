"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { useCategories } from "@/features/categories/useCategories";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { formatDateToISO } from "@/lib/formatters/formatDate";
import type { Expense, CreateExpensePayload, UpdateExpensePayload } from "../types";
import {
  Wallet,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  PlusCircle,
  Check,
} from "lucide-react";

export interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  onSubmitCreate?: (payload: CreateExpensePayload) => Promise<unknown>;
  onSubmitUpdate?: (id: string, payload: UpdateExpensePayload) => Promise<unknown>;
  onSuccess?: () => void;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  expenseToEdit,
  onSubmitCreate,
  onSubmitUpdate,
  onSuccess,
}: ExpenseFormModalProps) {
  const isEditing = Boolean(expenseToEdit);
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  // Form states
  const [amount, setAmount] = React.useState<string>("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize or reset form when modal opens or expenseToEdit changes
  React.useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setAmount(String(expenseToEdit.amount));
        setCategoryId(expenseToEdit.categoryId || "");
        const d = expenseToEdit.expenseDate || expenseToEdit.date;
        setDate(d ? formatDateToISO(d) : formatDateToISO(new Date()));
        setDescription(expenseToEdit.description || "");
      } else {
        setAmount("");
        setCategoryId("");
        setDate(formatDateToISO(new Date()));
        setDescription("");
      }
      setErrorMessage(null);
    }
  }, [isOpen, expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("يرجى إدخال مبلغ صحيح أكبر من الصفر.");
      return;
    }

    if (!date) {
      setErrorMessage("يرجى تحديد تاريخ المصروف.");
      return;
    }

    if (description.trim().length > 800) {
      setErrorMessage("لا يمكن أن يتجاوز الوصف 800 حرف.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && expenseToEdit && onSubmitUpdate) {
        await onSubmitUpdate(expenseToEdit.id, {
          amount: parsedAmount,
          categoryId: categoryId === "" ? null : categoryId,
          date,
          description: description.trim() || null,
        });
      } else if (onSubmitCreate) {
        await onSubmitCreate({
          amount: parsedAmount,
          categoryId: categoryId === "" ? null : categoryId,
          date,
          description: description.trim() || null,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("حدث خطأ غير متوقع أثناء حفظ المصروف.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(formatDateToISO(d));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل المصروف" : "إضافة مصروف جديد"}
      description={
        isEditing
          ? "تعديل تفاصيل المصروف وتحديث الرصيد الفوري"
          : "تسجيل حركة إنفاق جديدة وربطها بالتصنيف والميزانية"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error notification banner */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-status-danger-bg text-status-danger border border-status-danger/20 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* 1. Amount Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="expense-amount"
            className="block text-xs font-bold text-text-primary"
          >
            المبلغ <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <input
              id="expense-amount"
              type="number"
              step="any"
              min="0.01"
              required
              autoFocus={!isEditing}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              className="w-full min-h-[46px] px-3.5 pe-12 rounded-xl border border-border bg-surface text-base font-bold text-brand-primary dark:text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all"
            />
            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-xs font-bold text-brand-teal">
              ₪ ILS
            </div>
          </div>
        </div>

        {/* 2. Category Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="expense-category"
              className="block text-xs font-bold text-text-primary"
            >
              التصنيف
            </label>
            {categories.length === 0 && !isCategoriesLoading && (
              <Link
                href="/categories"
                onClick={onClose}
                className="text-[11px] font-semibold text-brand-teal hover:underline inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                <span>إضافة تصنيف جديد</span>
              </Link>
            )}
          </div>

          <div className="relative">
            <select
              id="expense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting || isCategoriesLoading}
              className="w-full min-h-[46px] px-3.5 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all appearance-none cursor-pointer"
            >
              <option value="">بدون تصنيف (غير مصنف)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.limit ? `(سقف: ₪${cat.limit})` : ""}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-text-muted">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 3. Date Selection + Quick buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="expense-date"
              className="block text-xs font-bold text-text-primary"
            >
              تاريخ العملية <span className="text-status-danger">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
              >
                أمس
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              id="expense-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full min-h-[46px] px-3.5 pe-10 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all"
            />
            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-text-muted">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 4. Description (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="expense-description"
              className="block text-xs font-bold text-text-primary"
            >
              الوصف والبيان <span className="text-[11px] font-normal text-text-muted">(اختياري)</span>
            </label>
            <span className="text-[10px] text-text-muted">
              {description.length}/800
            </span>
          </div>

          <div className="relative">
            <textarea
              id="expense-description"
              rows={2}
              maxLength={800}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: فاتورة الكهرباء، مشتريات سوبرماركت، وجبة غداء..."
              disabled={isSubmitting}
              className="w-full p-3 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all resize-none"
            />
          </div>
        </div>

        {/* Form Actions (Min touch target 44px) */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-text-secondary hover:bg-surface-muted active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? "حفظ التعديلات" : "إضافة المصروف"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
