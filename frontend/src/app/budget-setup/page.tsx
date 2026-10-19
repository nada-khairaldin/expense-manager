"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { type SupportedCurrency, type User } from "@/features/auth/types";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  LogOut,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface CurrencyOption {
  code: SupportedCurrency;
  symbol: string;
  nameAr: string;
  nameEn: string;
}

const CURRENCIES: CurrencyOption[] = [
  {
    code: "ILS",
    symbol: "₪",
    nameAr: "شيكل إسرائيلي جديد",
    nameEn: "Israeli Shekel",
  },
  {
    code: "USD",
    symbol: "$",
    nameAr: "دولار أمريكي",
    nameEn: "US Dollar",
  },
  {
    code: "JOD",
    symbol: "د.أ",
    nameAr: "دينار أردني",
    nameEn: "Jordanian Dinar",
  },
  {
    code: "EUR",
    symbol: "€",
    nameAr: "يورو أوروبي",
    nameEn: "Euro",
  },
];

const QUICK_DAYS = [
  { day: 1, label: "اليوم 1 (بداية الشهر)" },
  { day: 15, label: "اليوم 15 (منتصف الشهر)" },
  { day: 25, label: "اليوم 25 (رواتب)" },
  { day: 31, label: "اليوم 31 (نهاية الشهر)" },
];

interface BudgetSetupFormProps {
  user: User | null;
}

function BudgetSetupForm({ user }: BudgetSetupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeBudgetSetup } = useAuth();
  const isEditMode = searchParams.get("edit") === "true";

  const [currency, setCurrency] = React.useState<SupportedCurrency>(
    user?.currency && ["ILS", "USD", "JOD", "EUR"].includes(user.currency)
      ? (user.currency as SupportedCurrency)
      : "ILS"
  );

  const [renewalDay, setRenewalDay] = React.useState<number>(
    user?.budgetRenewalDay && user.budgetRenewalDay >= 1 && user.budgetRenewalDay <= 31
      ? user.budgetRenewalDay
      : 1
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // If user has already completed setup and not in edit mode, redirect to dashboard
  React.useEffect(() => {
    if (user && user.budgetSetupCompleted && !isEditMode) {
      router.replace("/dashboard");
    }
  }, [user, isEditMode, router]);

  const handleDayChange = (newDay: number) => {
    const clamped = Math.max(1, Math.min(31, newDay));
    setRenewalDay(clamped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      await completeBudgetSetup({
        currency,
        budgetRenewalDay: renewalDay,
      });

      setIsSuccess(true);

      // Brief delay to give satisfying visual feedback
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("تعذر حفظ الإعدادات، يرجى المحاولة لاحقاً");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator Header */}
      <div className="space-y-2 text-center sm:text-start">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="primary" size="md" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>الإعداد الأولي للميزانية</span>
          </Badge>
          {user && (
            <span className="text-xs text-text-secondary">
              مرحباً بك، <strong className="text-brand-primary dark:text-foreground">{user.name}</strong>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-brand-primary dark:text-foreground tracking-tight">
          ضبط إعدادات الميزانية الأساسية
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
          حدد العملة المعتمدة لدخلك ومصروفاتك، بالإضافة إلى يوم تجديد دورتك المالية الشهرية.
          يمكنك لاحقاً تعديل هذه الإعدادات في أي وقت.
        </p>
      </div>

      {/* Error Notification */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs font-medium animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div
          role="status"
          className="flex items-center gap-3 p-4 rounded-2xl bg-status-success-bg border border-status-success/30 text-status-success text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            تم حفظ إعدادات الميزانية بنجاح! جاري التوجيه إلى لوحة التحكم...
          </div>
        </div>
      )}

      {/* 1. Currency Selection Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                1. اختر العملة المعتمدة
              </CardTitle>
              <CardDescription>
                العملة التي سيتم بها تسجيل الميزانية والمصروفات والتقارير
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            role="radiogroup"
            aria-label="اختيار العملة"
          >
            {CURRENCIES.map((cur) => {
              const isSelected = currency === cur.code;

              return (
                <button
                  key={cur.code}
                  type="button"
                  onClick={() => setCurrency(cur.code)}
                  disabled={isSubmitting}
                  role="radio"
                  aria-checked={isSelected}
                  className={cn(
                    "relative p-4 rounded-2xl border text-start transition-all flex flex-col justify-between h-32 focus:outline-none focus:ring-2 focus:ring-brand-teal",
                    isSelected
                      ? "border-brand-teal bg-brand-teal-light/40 dark:bg-brand-teal/15 ring-2 ring-brand-teal/30 shadow-sm"
                      : "border-border bg-surface hover:bg-surface-muted/60"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-black text-brand-primary dark:text-foreground">
                      {cur.symbol}
                    </span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-brand-teal text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="font-bold text-xs text-brand-primary dark:text-foreground">
                      {cur.nameAr}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-0.5">
                      {cur.code}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Budget Renewal Day Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-gold/10 dark:bg-brand-gold/20 text-brand-gold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                2. يوم تجديد دورة الميزانية الشهرية
              </CardTitle>
              <CardDescription>
                اليوم الذي تبدأ فيه دورة مالية جديدة لحساب المصاريف والمتبقي
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Quick Selection Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-secondary block">
              خيارات شائعة وسريعة:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_DAYS.map((preset) => {
                const isSelected = renewalDay === preset.day;
                return (
                  <button
                    key={preset.day}
                    type="button"
                    onClick={() => handleDayChange(preset.day)}
                    disabled={isSubmitting}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                      isSelected
                        ? "bg-brand-primary text-white border-brand-primary dark:bg-brand-teal dark:border-brand-teal shadow-sm"
                        : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Stepper & Slider */}
          <div className="p-4 rounded-2xl border border-border bg-surface-muted/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-primary dark:text-foreground block">
                  اليوم المحدد لتجديد الدورة:
                </span>
                <span className="text-[11px] text-text-muted">
                  اختر أي يوم من 1 إلى 31 من الشهر التقويمي
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDayChange(renewalDay - 1)}
                  disabled={renewalDay <= 1 || isSubmitting}
                  className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-text-primary hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  aria-label="اليوم السابق"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-0" />
                </button>

                <div className="flex items-center justify-center w-16 h-9 rounded-xl bg-surface border border-border font-extrabold text-sm text-brand-primary dark:text-foreground">
                  {renewalDay}
                </div>

                <button
                  type="button"
                  onClick={() => handleDayChange(renewalDay + 1)}
                  disabled={renewalDay >= 31 || isSubmitting}
                  className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-text-primary hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  aria-label="اليوم التالي"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
                </button>
              </div>
            </div>

            {/* Range Slider for Fluid Mobile/Desktop Interaction */}
            <div className="pt-2">
              <input
                type="range"
                min={1}
                max={31}
                step={1}
                value={renewalDay}
                onChange={(e) => handleDayChange(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full accent-brand-teal h-2 bg-border rounded-lg cursor-pointer transition-all"
                aria-label="شريط تمرير يوم تجديد الميزانية"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
                <span>1 (أول الشهر)</span>
                <span>15</span>
                <span>31 (نهاية الشهر)</span>
              </div>
            </div>
          </div>

          {/* Plain-Language Explanation Callout */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-teal-light/40 dark:bg-brand-teal/10 border border-brand-teal/20 text-xs text-text-secondary leading-relaxed">
            <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-brand-primary dark:text-foreground">
                كيف تعمل دورة الميزانية في مصروفي؟
              </p>
              <p>
                يبدأ حساب ميزانيتك ومصروفاتك في اليوم <strong>{renewalDay}</strong> من كل شهر ميلادي وينتهي قبل بدء الدورة التالية.
              </p>
              <p className="text-[11px] text-text-muted">
                ملاحظة مهمة: في الأشهر التي لا تحتوي على هذا اليوم (مثلاً في حال اختيار يوم 31 في شهر فبراير المكون من 28 أو 29 يومًا، أو الأشهر ذات الـ 30 يومًا)، ستتجدد الدورة تلقائيًا في <strong>اليوم الأخير</strong> من ذلك الشهر.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
            isSubmitting || isSuccess
              ? "bg-brand-primary/80 cursor-not-allowed opacity-80"
              : "bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99]"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري حفظ الإعدادات والمتابعة...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-brand-teal" />
              <span>تم الحفظ! جاري الانتقال...</span>
            </>
          ) : (
            <>
              <span>حفظ الإعدادات والمتابعة</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function BudgetSetupPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard requireAuth={true} requireSetupComplete={false}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-brand-teal selection:text-white">
        {/* Header */}
        <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Logo variant="horizontal" size="md" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </header>

        {/* Setup Content */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <React.Suspense
            fallback={
              <div className="flex justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
              </div>
            }
          >
            <BudgetSetupForm
              key={user?.id || "initial-setup"}
              user={user}
            />
          </React.Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
