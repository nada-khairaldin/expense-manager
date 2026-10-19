"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/features/auth/AuthContext";
import { updateCurrentCycleBudgetApi, updateCycleBudgetByIdApi } from "@/features/auth/api";
import { Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditCycleBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  cycleId?: string;
  onSuccess?: (newAmount: number) => void;
}

const PRESET_BUDGETS = [3000, 5000, 8000, 10000, 15000];

function EditCycleBudgetModalContent({
  onClose,
  initialAmount,
  cycleId,
  onSuccess,
}: {
  onClose: () => void;
  initialAmount?: number;
  cycleId?: string;
  onSuccess?: (newAmount: number) => void;
}) {
  const { user, token } = useAuth();
  const [amount, setAmount] = React.useState<string>(() => {
    if (initialAmount) return String(initialAmount);
    if (user?.defaultBudgetAmount) return String(user.defaultBudgetAmount);
    return "5000";
  });
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

    if (!token) {
      setErrorMessage("يجب تسجيل الدخول لإجراء التعديل");
      return;
    }

    setIsSubmitting(true);
    try {
      if (cycleId) {
        await updateCycleBudgetByIdApi(cycleId, parsedAmount, token);
      } else {
        await updateCurrentCycleBudgetApi(parsedAmount, token);
      }

      setIsSuccess(true);
      onSuccess?.(parsedAmount);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("تعذر تعديل ميزانية الدورة، يرجى المحاولة لاحقاً");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Independence & Scope Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-gold/10 dark:bg-brand-gold/20 border border-brand-gold/30 text-xs text-text-secondary leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-brand-primary dark:text-foreground block">
            نطاق التعديل المستقل للدورة الحالية:
          </span>
          <p>
            هذا التعديل <strong>يقتصر حصراً على الدورة الحالية النشطة</strong>.
          </p>
          <p>
            لن يغير <strong>الميزانية الافتراضية</strong> لحسابك، ولن يؤثر على أي دورات سابقة منتهية أو دورات مستقبلية.
          </p>
          <p className="text-[11px] text-text-muted">
            جميع المصروفات المسجلة في هذه الدورة تظل محفوظة تماماً دون تغيير.
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
          <span>تم تحديث ميزانية الدورة الحالية بنجاح!</span>
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
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary dark:bg-brand-teal dark:border-brand-teal shadow-sm"
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
          htmlFor="cycleBudgetModalInput"
          className="text-xs font-bold text-brand-primary dark:text-foreground block"
        >
          ميزانية الدورة الحالية:
        </label>
        <div className="relative">
          <input
            id="cycleBudgetModalInput"
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
            placeholder="5000"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-brand-primary dark:text-foreground font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all pe-12"
          />
          <span className="absolute inset-y-0 end-0 pe-4 flex items-center text-text-muted font-bold text-xs pointer-events-none">
            {currencySymbol}
          </span>
        </div>
      </div>

      {/* Dialog Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all",
            isSubmitting || isSuccess
              ? "bg-brand-primary/70 cursor-not-allowed"
              : "bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99]"
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
            <span>تحديث ميزانية هذه الدورة</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function EditCycleBudgetModal({
  isOpen,
  onClose,
  initialAmount,
  cycleId,
  onSuccess,
}: EditCycleBudgetModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل ميزانية الدورة الحالية فقط"
      description="تخصيص ميزانية استثنائية للدورة النشطة دون المساس بالإعدادات الافتراضية"
    >
      {isOpen && (
        <EditCycleBudgetModalContent
          onClose={onClose}
          initialAmount={initialAmount}
          cycleId={cycleId}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
