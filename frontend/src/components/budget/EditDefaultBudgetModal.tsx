"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader2, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditDefaultBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newAmount: number) => void;
}

const PRESET_BUDGETS = [3000, 5000, 8000, 10000, 15000];

function EditDefaultBudgetModalContent({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: (newAmount: number) => void;
}) {
  const { user, updateDefaultBudget } = useAuth();
  const [amount, setAmount] = React.useState<string>(
    user?.defaultBudgetAmount ? String(user.defaultBudgetAmount) : "5000"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const currencySymbol =
    user?.currency === "USD"
      ? "$"
      : user?.currency === "EUR"
      ? "€"
      : user?.currency === "JOD"
      ? "د.أ"
      : "₪";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("يرجى إدخال مبلغ ميزانية صحيح أكبر من الصفر");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDefaultBudget(parsedAmount);
      setIsSuccess(true);
      onSuccess?.(parsedAmount);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("تعذر تحديث الميزانية الافتراضية، يرجى المحاولة لاحقاً");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Clear Scope Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-teal-light/40 dark:bg-brand-teal/15 border border-brand-teal/30 text-xs text-text-secondary leading-relaxed">
        <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-brand-primary dark:text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            أثر تغيير الميزانية الافتراضية:
          </span>
          <p>
            1. سيتم تحديث ميزانية <strong>الدورة النشطة الحالية</strong> فوراً بهذا المبلغ.
          </p>
          <p>
            2. سيُعتمد هذا المبلغ تلقائياً لجميع <strong>الدورات المستقبلية</strong> عند إنشائها.
          </p>
          <p className="text-[11px] text-text-muted">
            3. الدورات السابقة المنتهية <strong>لن تتأثر</strong> وستحتفظ بميزانياتها التاريخية المسجلة.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs font-semibold"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم تحديث الميزانية الافتراضية والدورة الحالية بنجاح!</span>
        </div>
      )}

      {/* Quick Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-text-secondary block">
          مبالغ مقترحة سريعة:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_BUDGETS.map((preset) => {
            const isSelected = amount === String(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                disabled={isSubmitting}
                className={cn(
                  "px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold transition-all border touch-manipulation active:scale-95",
                  isSelected
                    ? "bg-brand-teal text-white border-brand-teal shadow-sm"
                    : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
                )}
              >
                {preset.toLocaleString()} {currencySymbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="defaultBudgetModalInput"
          className="text-xs font-bold text-brand-primary dark:text-foreground block"
        >
          الميزانية الافتراضية الجديدة:
        </label>
        <div className="relative">
          <input
            id="defaultBudgetModalInput"
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
            placeholder="5000"
            className="w-full h-11 px-4 py-2.5 rounded-xl border border-border bg-surface text-brand-primary dark:text-foreground font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all pe-12"
          />
          <span className="absolute inset-y-0 end-0 pe-4 flex items-center text-text-muted font-bold text-xs pointer-events-none">
            {currencySymbol}
          </span>
        </div>
      </div>

      {/* Dialog Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-muted active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all touch-manipulation",
            isSubmitting || isSuccess
              ? "bg-brand-primary/70 cursor-not-allowed"
              : "bg-brand-teal hover:bg-brand-teal/90 active:scale-95"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم الحفظ!</span>
            </>
          ) : (
            <span>حفظ الميزانية الافتراضية</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function EditDefaultBudgetModal({
  isOpen,
  onClose,
  onSuccess,
}: EditDefaultBudgetModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل الميزانية الشهرية الافتراضية"
      description="تحديد المبلغ المعتمد تلقائياً لدورات الميزانية في حسابك"
    >
      {isOpen && (
        <EditDefaultBudgetModalContent
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
