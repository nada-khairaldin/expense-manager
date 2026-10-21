"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { CategoryItem } from "../types";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Loader2, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickEditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  onUpdateLimit: (categoryId: string, newLimit: number | null) => Promise<void> | void;
}

interface QuickEditLimitFormProps {
  category: CategoryItem;
  onClose: () => void;
  onUpdateLimit: (categoryId: string, newLimit: number | null) => Promise<void> | void;
}

function QuickEditLimitForm({ category, onClose, onUpdateLimit }: QuickEditLimitFormProps) {
  const [limitValue, setLimitValue] = React.useState<string>(() =>
    category.limit !== null && category.limit !== undefined ? String(category.limit) : ""
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = limitValue.trim();
    let parsedLimit: number | null = null;

    if (trimmed !== "") {
      const num = Number(trimmed);
      if (isNaN(num) || num <= 0) {
        setError("يجب أن يكون حد الإنفاق رقمًا موجبًا أكبر من صفر (أو اتركيه فارغًا لإلغاء الحد).");
        return;
      }
      parsedLimit = num;
    }

    try {
      setIsSubmitting(true);
      await onUpdateLimit(category.id, parsedLimit);
      onClose();
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Category Identity */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface-muted/40">
        <CategoryIcon iconName={category.icon} color={category.color} size="md" />
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-bold text-text-primary truncate">{category.name}</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            الإنفاق الفعلي المسجل: {category.spent !== null ? formatCurrency(category.spent) : "غير متوفر"}
          </div>
        </div>
      </div>

      {/* Limit Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="quick-limit-input" className="block text-xs font-bold text-text-primary">
            الحد المالي الجديد
          </label>
          <span className="text-[11px] text-text-muted">المبلغ بالعملة المعتمدة</span>
        </div>
        <input
          id="quick-limit-input"
          type="number"
          step="any"
          min="0"
          value={limitValue}
          onChange={(e) => setLimitValue(e.target.value)}
          placeholder="اتركيه فارغًا لإلغاء الحد المالي"
          className={cn(
            "w-full px-3.5 h-11 sm:h-10 rounded-xl border bg-surface-muted/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
            error ? "border-status-danger" : "border-border"
          )}
          disabled={isSubmitting}
          autoFocus
        />
        {error ? (
          <p className="text-[11px] text-status-danger mt-1">{error}</p>
        ) : (
          <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
            إذا تركتِ الحقل فارغًا، سيصبح التصنيف &quot;بدون حد إنفاق&quot;.
          </p>
        )}
      </div>

      {/* Quick Amount Suggestion Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-text-muted">اقتراحات سريعة بلمسة واحدة:</span>
        <div className="flex flex-wrap gap-2">
          {[500, 1000, 1500, 2000, 3000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setLimitValue(String(amt))}
              className="px-3 py-1.5 min-h-[38px] rounded-xl border border-border bg-surface-muted/50 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-brand-teal active:scale-95 transition-all touch-manipulation"
            >
              {formatCurrency(amt)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLimitValue("")}
            className="px-3 py-1.5 min-h-[38px] rounded-xl border border-border bg-surface-muted/50 text-xs font-bold text-text-muted hover:text-status-warning active:scale-95 transition-all touch-manipulation"
          >
            إلغاء الحد
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-border mt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-10 px-5 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs sm:text-sm font-semibold transition-colors active:scale-95"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-10 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-brand-primary text-white text-xs sm:text-sm font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Sliders className="w-3.5 h-3.5" />
              <span>حفظ الحد المالي</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function QuickEditLimitModal({
  isOpen,
  onClose,
  category,
  onUpdateLimit,
}: QuickEditLimitModalProps) {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل حد الإنفاق"
      description={`تعديل أو إلغاء السقف المالي المخصص لتصنيف "${category.name}".`}
      className="max-w-md"
    >
      <QuickEditLimitForm
        key={category.id}
        category={category}
        onClose={onClose}
        onUpdateLimit={onUpdateLimit}
      />
    </Modal>
  );
}
