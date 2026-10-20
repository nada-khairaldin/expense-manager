"use client";

import * as React from "react";
import {
  Shield,
  Moon,
  User as UserIcon,
  CheckCircle2,
  Wallet,
  Sparkles,
  AlertCircle,
  Coins,
  CalendarDays,
  Save,
  RotateCcw,
  Loader2,
  Info,
  ChevronRight,
  ChevronLeft,
  Check,
  Edit3,
  X,
  Lock,
  Mail,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/AuthContext";
import { getCurrentBudgetCycleApi } from "@/features/auth/api";
import { type BudgetCycle, type SupportedCurrency } from "@/features/auth/types";
import { EditDefaultBudgetModal } from "@/components/budget/EditDefaultBudgetModal";
import { EditCycleBudgetModal } from "@/components/budget/EditCycleBudgetModal";
import { cn } from "@/lib/utils";

interface CurrencyOption {
  code: SupportedCurrency;
  symbol: string;
  nameAr: string;
  nameEn: string;
  description: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: "ILS",
    symbol: "₪",
    nameAr: "شيكل إسرائيلي جديد",
    nameEn: "Israeli Shekel",
    description: "العملة المتداولة محلياً",
  },
  {
    code: "USD",
    symbol: "$",
    nameAr: "دولار أمريكي",
    nameEn: "US Dollar",
    description: "الدولار الأمريكي القياسي",
  },
  {
    code: "JOD",
    symbol: "د.أ",
    nameAr: "دينار أردني",
    nameEn: "Jordanian Dinar",
    description: "الدينار الأردني",
  },
  {
    code: "EUR",
    symbol: "€",
    nameAr: "يورو أوروبي",
    nameEn: "Euro",
    description: "اليورو الأوروبي الموحد",
  },
];

const QUICK_DAYS = [
  { day: 1, label: "اليوم 1", note: "بداية الشهر" },
  { day: 15, label: "اليوم 15", note: "منتصف الشهر" },
  { day: 25, label: "اليوم 25", note: "إيداع الرواتب" },
  { day: 31, label: "اليوم 31", note: "نهاية الشهر" },
];

export default function SettingsPage() {
  const { user, token, completeBudgetSetup, updateProfile } = useAuth();

  const [currentCycle, setCurrentCycle] = React.useState<BudgetCycle | null>(null);
  const [isDefaultBudgetModalOpen, setIsDefaultBudgetModalOpen] = React.useState(false);
  const [isCycleBudgetModalOpen, setIsCycleBudgetModalOpen] = React.useState(false);

  // User Profile Name Editing State
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(user?.name || "");
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [nameSuccessMessage, setNameSuccessMessage] = React.useState<string | null>(null);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<string | null>(null);

  // Saved values from user account for Currency and Renewal Day
  const currentSavedCurrency = (user?.currency as SupportedCurrency) || "ILS";
  const currentSavedRenewalDay = user?.budgetRenewalDay || 1;

  // Local state for inline editing of Currency and Renewal Day
  const [selectedCurrency, setSelectedCurrency] = React.useState<SupportedCurrency>(currentSavedCurrency);
  const [selectedRenewalDay, setSelectedRenewalDay] = React.useState<number>(currentSavedRenewalDay);

  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = React.useState<string | null>(null);

  // Synchronize state when user data is loaded/updated
  React.useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
    if (user?.currency && ["ILS", "USD", "JOD", "EUR"].includes(user.currency)) {
      setSelectedCurrency(user.currency as SupportedCurrency);
    }
    if (user?.budgetRenewalDay && user.budgetRenewalDay >= 1 && user.budgetRenewalDay <= 31) {
      setSelectedRenewalDay(user.budgetRenewalDay);
    }
  }, [user?.name, user?.currency, user?.budgetRenewalDay]);

  // Check if user has changed either currency or renewal day
  const hasCurrencyOrDayChanges =
    selectedCurrency !== currentSavedCurrency ||
    selectedRenewalDay !== currentSavedRenewalDay;

  const currentCurrencyInfo =
    CURRENCY_OPTIONS.find((c) => c.code === currentSavedCurrency) || {
      code: currentSavedCurrency,
      symbol: currentSavedCurrency,
      nameAr: currentSavedCurrency,
      nameEn: currentSavedCurrency,
      description: "",
    };

  const defaultBudget = user?.defaultBudgetAmount ?? null;

  const loadCycle = React.useCallback(() => {
    if (!token) return;
    getCurrentBudgetCycleApi(token)
      .then((cycle) => {
        setCurrentCycle(cycle);
      })
      .catch(() => {});
  }, [token]);

  React.useEffect(() => {
    let isMounted = true;
    if (!token) return;
    getCurrentBudgetCycleApi(token)
      .then((cycle) => {
        if (isMounted) setCurrentCycle(cycle);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleDayChange = (newDay: number) => {
    const clamped = Math.max(1, Math.min(31, Math.floor(newDay)));
    setSelectedRenewalDay(clamped);
  };

  const handleResetCurrencyAndDay = () => {
    setSelectedCurrency(currentSavedCurrency);
    setSelectedRenewalDay(currentSavedRenewalDay);
    setSaveErrorMessage(null);
  };

  // Handle saving Name
  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed || trimmed.length < 2) {
      setNameErrorMessage("يجب أن يتكون الاسم من حرفين على الأقل");
      return;
    }

    if (trimmed === user?.name) {
      setIsEditingName(false);
      setNameErrorMessage(null);
      return;
    }

    setIsSavingName(true);
    setNameErrorMessage(null);
    setNameSuccessMessage(null);

    try {
      await updateProfile({ name: trimmed });
      setIsEditingName(false);
      setNameSuccessMessage("تم تحديث اسم المستخدم بنجاح!");
      setTimeout(() => {
        setNameSuccessMessage(null);
      }, 3500);
    } catch (err) {
      if (err instanceof Error) {
        setNameErrorMessage(err.message);
      } else {
        setNameErrorMessage("تعذر تحديث الاسم، يرجى المحاولة لاحقاً");
      }
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle saving Currency & Renewal Day
  const handleSaveCurrencyAndRenewalDay = async () => {
    if (isSavingSettings || !hasCurrencyOrDayChanges) return;

    setIsSavingSettings(true);
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      await completeBudgetSetup({
        currency: selectedCurrency,
        budgetRenewalDay: selectedRenewalDay,
        ...(user?.defaultBudgetAmount ? { defaultBudgetAmount: user.defaultBudgetAmount } : {}),
      });

      setSaveSuccessMessage("تم حفظ إعدادات العملة ودورة الميزانية بنجاح!");
      loadCycle();

      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    } catch (err) {
      if (err instanceof Error) {
        setSaveErrorMessage(err.message);
      } else {
        setSaveErrorMessage("تعذر حفظ التعديلات، يرجى المحاولة لاحقاً");
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Safe localized date strings
  const formattedJoinDate = React.useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      return new Date(user.createdAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  }, [user?.createdAt]);

  const formattedCycleEndDate = React.useMemo(() => {
    if (!currentCycle?.endDate) return null;
    try {
      return new Date(currentCycle.endDate).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  }, [currentCycle?.endDate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-primary dark:text-foreground tracking-tight">
            الإعدادات والتفضيلات
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            إدارة بيانات الحساب الشخصي، العملة المركزية، دورة الميزانية الشهرية، ومظهر التطبيق
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="primary" size="md" className="gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>إعدادات النظام</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* ========================================================
            SECTION 1 (UX): USER PROFILE & IDENTITY (الملف الشخصي)
           ======================================================== */}
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-muted/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-foreground flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold">
                    الملف الشخصي والحساب
                  </CardTitle>
                  <CardDescription className="text-xs">
                    بيانات المستخدم الأساسية والاسم المعروض في النظام
                  </CardDescription>
                </div>
              </div>

              {user?.budgetSetupCompleted && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success-bg border border-status-success/20 text-status-success text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حساب مفعل ونشط</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Name Success Notification */}
            {nameSuccessMessage && (
              <div
                role="status"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs font-semibold animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{nameSuccessMessage}</span>
              </div>
            )}

            {/* Name Error Notification */}
            {nameErrorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs font-semibold animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{nameErrorMessage}</span>
              </div>
            )}

            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-muted/30 space-y-3.5 text-xs">
              {/* Row 1: User Full Name (Editable Inline) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 font-semibold text-text-secondary min-w-[130px]">
                  <UserIcon className="w-4 h-4 text-brand-teal" />
                  <span>الاسم الكامل:</span>
                </div>

                <div className="flex-1 max-w-md">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          disabled={isSavingName}
                          autoFocus
                          placeholder="أدخل اسمك الكامل"
                          className="w-full px-3.5 py-2 rounded-xl border border-brand-teal bg-surface text-brand-primary dark:text-foreground font-bold text-xs focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingName}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                        title="حفظ الاسم الجديد"
                      >
                        {isSavingName ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>حفظ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setNameInput(user?.name || "");
                          setNameErrorMessage(null);
                        }}
                        disabled={isSavingName}
                        className="p-2 rounded-xl border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted active:scale-95 transition-all"
                        title="إلغاء التعديل"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-bold text-sm text-brand-primary dark:text-foreground">
                        {user?.name || "مستخدم مصروفي"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(user?.name || "");
                          setIsEditingName(true);
                          setNameErrorMessage(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted hover:text-brand-teal text-[11px] font-semibold text-text-secondary transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-brand-teal" />
                        <span>تعديل الاسم</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Email (Read-only / Verified) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2 font-semibold text-text-secondary">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <span>البريد الإلكتروني:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-brand-primary dark:text-foreground dir-ltr font-medium">
                    {user?.email || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted font-medium">
                    <Lock className="w-2.5 h-2.5 text-text-muted" />
                    <span>مؤمّن</span>
                  </span>
                </div>
              </div>

              {/* Row 3: Account Registration Date */}
              {formattedJoinDate && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-2 font-semibold text-text-secondary">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span>تاريخ الانضمام:</span>
                  </div>
                  <span className="text-text-muted font-medium text-xs">
                    {formattedJoinDate}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 2 (UX): CURRENCY & BUDGET CYCLE (INLINE EDITING)
           ======================================================== */}
        <Card className="border-brand-teal/20 dark:border-border shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-muted/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold">
                    العملة المعتمدة ودورة الميزانية الشهرية
                  </CardTitle>
                  <CardDescription className="text-xs">
                    تعديل العملة الرسمية ويوم تجديد الدورة المالية الشهرية لحسابك مباشرة دون مغادرة الصفحة
                  </CardDescription>
                </div>
              </div>

              {/* Current Active Indicator Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-secondary font-medium self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                <span>
                  المعتمد حالياً: <strong className="text-brand-primary dark:text-foreground">{currentCurrencyInfo.nameAr} ({currentCurrencyInfo.symbol})</strong> • <strong className="text-brand-primary dark:text-foreground">اليوم {currentSavedRenewalDay}</strong>
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Success Banner */}
            {saveSuccessMessage && (
              <div
                role="status"
                className="flex items-center gap-3 p-4 rounded-2xl bg-status-success-bg border border-status-success/30 text-status-success text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="flex-1">{saveSuccessMessage}</div>
              </div>
            )}

            {/* Error Banner */}
            {saveErrorMessage && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-2xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{saveErrorMessage}</div>
              </div>
            )}

            {/* Part A: Currency Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-brand-primary dark:text-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-brand-teal" />
                  <span>1. العملة المعتمدة في النظام:</span>
                </label>
                <span className="text-[11px] text-text-muted">
                  اختر عملة الحساب المركزية
                </span>
              </div>

              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
                role="radiogroup"
                aria-label="اختيار العملة المعتمدة"
              >
                {CURRENCY_OPTIONS.map((cur) => {
                  const isSelected = selectedCurrency === cur.code;
                  return (
                    <button
                      key={cur.code}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedCurrency(cur.code)}
                      disabled={isSavingSettings}
                      className={cn(
                        "relative p-3.5 sm:p-4 rounded-2xl border text-start transition-all duration-200 flex flex-col justify-between h-28 sm:h-32 focus:outline-none focus:ring-2 focus:ring-brand-teal active:scale-[0.98] cursor-pointer",
                        isSelected
                          ? "border-brand-teal bg-brand-teal/10 dark:bg-brand-teal/20 ring-2 ring-brand-teal/30 shadow-xs"
                          : "border-border bg-surface hover:bg-surface-muted/60 text-text-secondary hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={cn(
                            "text-2xl sm:text-3xl font-black font-mono transition-colors",
                            isSelected
                              ? "text-brand-teal dark:text-brand-teal"
                              : "text-brand-primary dark:text-foreground"
                          )}
                        >
                          {cur.symbol}
                        </span>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-border" />
                        )}
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <div
                          className={cn(
                            "font-bold text-xs sm:text-sm line-clamp-1",
                            isSelected
                              ? "text-brand-primary dark:text-foreground font-extrabold"
                              : "text-text-primary"
                          )}
                        >
                          {cur.nameAr}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono uppercase">
                          <span>{cur.code}</span>
                          <span className="text-[9px] text-text-muted truncate max-w-[80px]">
                            {cur.nameEn}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Part B: Renewal Day Selection */}
            <div className="space-y-4 pt-2 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs sm:text-sm font-bold text-brand-primary dark:text-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-brand-gold" />
                  <span>2. يوم تجديد دورة الميزانية الشهرية:</span>
                </label>
                <span className="text-[11px] text-text-muted">
                  اليوم الذي تبدأ فيه الدورة المالية الجديدة شهرياً
                </span>
              </div>

              {/* Quick Preset Buttons (Mobile-friendly chips) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-text-secondary block">
                  خيارات شائعة وسريعة:
                </span>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {QUICK_DAYS.map((preset) => {
                    const isSelected = selectedRenewalDay === preset.day;
                    return (
                      <button
                        key={preset.day}
                        type="button"
                        onClick={() => handleDayChange(preset.day)}
                        disabled={isSavingSettings}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-between sm:justify-start gap-2 active:scale-[0.98]",
                          isSelected
                            ? "bg-brand-primary text-white border-brand-primary dark:bg-brand-teal dark:border-brand-teal shadow-xs font-bold"
                            : "border-border bg-surface text-text-secondary hover:bg-surface-muted hover:text-foreground"
                        )}
                      >
                        <span>{preset.label}</span>
                        <span
                          className={cn(
                            "text-[10px]",
                            isSelected ? "text-white/80" : "text-text-muted"
                          )}
                        >
                          ({preset.note})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stepper & Slider Box */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-muted/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-primary dark:text-foreground block">
                      اليوم المعتمد لتجديد الدورة:
                    </span>
                    <span className="text-[11px] text-text-muted">
                      اختر أي يوم بين 1 و 31 من الشهر التقويمي
                    </span>
                  </div>

                  {/* Stepper with touch-friendly size */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDayChange(selectedRenewalDay - 1)}
                      disabled={selectedRenewalDay <= 1 || isSavingSettings}
                      className="w-11 h-11 rounded-xl border border-border bg-surface flex items-center justify-center text-text-primary hover:bg-surface-muted active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      aria-label="اليوم السابق"
                    >
                      <ChevronRight className="w-5 h-5 rtl:rotate-0" />
                    </button>

                    <div className="flex flex-col items-center justify-center min-w-[95px] h-11 rounded-xl bg-surface border border-border px-3 font-mono">
                      <span className="font-black text-base text-brand-primary dark:text-foreground">
                        اليوم {selectedRenewalDay}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDayChange(selectedRenewalDay + 1)}
                      disabled={selectedRenewalDay >= 31 || isSavingSettings}
                      className="w-11 h-11 rounded-xl border border-border bg-surface flex items-center justify-center text-text-primary hover:bg-surface-muted active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      aria-label="اليوم التالي"
                    >
                      <ChevronLeft className="w-5 h-5 rtl:rotate-0" />
                    </button>
                  </div>
                </div>

                {/* Range Slider for fluid mobile & desktop interaction */}
                <div className="pt-2">
                  <input
                    type="range"
                    min={1}
                    max={31}
                    step={1}
                    value={selectedRenewalDay}
                    onChange={(e) => handleDayChange(Number(e.target.value))}
                    disabled={isSavingSettings}
                    className="w-full accent-brand-teal h-2.5 bg-border rounded-lg cursor-pointer transition-all"
                    aria-label="شريط تمرير يوم تجديد دورة الميزانية"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-1.5 font-mono">
                    <span>1 (بداية الشهر)</span>
                    <span>15 (المنتصف)</span>
                    <span>31 (نهاية الشهر)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Informational Callout */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-teal-light/40 dark:bg-brand-teal/10 border border-brand-teal/20 text-xs text-text-secondary leading-relaxed">
                <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-brand-primary dark:text-foreground">
                    كيف تعمل دورة الميزانية الشهرية؟
                  </p>
                  <p>
                    تبدأ دورتك المالية في اليوم <strong>{selectedRenewalDay}</strong> من كل شهر ميلادي، وتستمر حتى اليوم السابق لبدء الدورة التالية.
                  </p>
                  <p className="text-[11px] text-text-muted">
                    ملاحظة ذكية: في الأشهر التي تقل أيامها عن اليوم المختار (مثل شهر فبراير)، يتم اعتماد <strong>اليوم الأخير الفعلي</strong> من الشهر تلقائياً لضمان سلاسة الحسابات.
                  </p>
                </div>
              </div>
            </div>

            {/* Part C: Save & Action Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {hasCurrencyOrDayChanges ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-gold font-bold">
                    <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                    <span>لديك تعديلات غير محفوظة على العملة أو يوم التجديد</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    <span>الإعدادات الحالية محفوظة ومطابقة للحساب</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
                {hasCurrencyOrDayChanges && (
                  <button
                    type="button"
                    onClick={handleResetCurrencyAndDay}
                    disabled={isSavingSettings}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-muted text-xs font-semibold active:scale-[0.98] transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تراجع عن التعديل</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveCurrencyAndRenewalDay}
                  disabled={!hasCurrencyOrDayChanges || isSavingSettings}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
                    hasCurrencyOrDayChanges && !isSavingSettings
                      ? "bg-brand-teal hover:opacity-95 cursor-pointer"
                      : "bg-surface-muted text-text-muted border border-border cursor-not-allowed opacity-70"
                  )}
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>جاري حفظ الإعدادات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ تعديلات العملة والدورة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 3 (UX): BUDGET PLANS & CYCLES (خطة وسقوف الميزانية)
           ======================================================== */}
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-muted/15">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 dark:bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>خطة وسقوف الميزانية</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  إدارة المبالغ المالية المعتمدة للميزانية الافتراضية ودورة الإنفاق النشطة
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="p-4 sm:p-5 rounded-xl border border-border bg-surface-muted/40 space-y-3 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-brand-primary dark:text-foreground block">
                    الميزانية الشهرية الافتراضية:
                  </span>
                  <span className="text-[11px] text-text-muted">
                    تُطبق تلقائياً على كل دورة جديدة وتحدث الدورة النشطة
                  </span>
                </div>
                <span className="font-mono font-black text-sm sm:text-base text-brand-teal">
                  {defaultBudget !== null
                    ? `${defaultBudget.toLocaleString()} ${currentCurrencyInfo.symbol}`
                    : "غير محددة"}
                </span>
              </div>

              {currentCycle && (
                <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
                  <div>
                    <span className="font-semibold text-brand-primary dark:text-foreground block">
                      ميزانية الدورة النشطة الحالية:
                    </span>
                    <span className="text-[11px] text-text-muted">
                      مخصصة للدورة الحالية {formattedCycleEndDate ? `(حتى ${formattedCycleEndDate})` : ""}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm sm:text-base text-brand-primary dark:text-foreground">
                    {currentCycle.budgetAmount.toLocaleString()} {currentCurrencyInfo.symbol}
                  </span>
                </div>
              )}
            </div>

            {/* Separate UI Actions for Default Budget and Current Cycle Budget */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Action 1: Edit Default Budget */}
                <button
                  type="button"
                  onClick={() => setIsDefaultBudgetModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-brand-teal text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تعديل الميزانية الافتراضية</span>
                </button>

                {/* Action 2: Edit Current Cycle Budget */}
                <button
                  type="button"
                  onClick={() => setIsCycleBudgetModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-brand-primary text-white text-xs sm:text-sm font-bold hover:bg-brand-primary-hover transition-all shadow-sm active:scale-[0.98]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>تعديل ميزانية الدورة الحالية فقط</span>
                </button>
              </div>

              {/* Explanatory callout showing differences */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-surface-muted/20 text-[11px] text-text-secondary leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-brand-primary dark:text-foreground">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                  <span>الفرق بين الإجرائين:</span>
                </div>
                <p>
                  • <strong>الميزانية الافتراضية:</strong> يحفظ القيمة الافتراضية لحسابك، ويحدث فوراً ميزانية الدورة الحالية النشطة، ويُطبق على جميع الدورات المستقبلية تلقائياً.
                </p>
                <p>
                  • <strong>ميزانية الدورة الحالية:</strong> يخص فقط الدورة الحالية النشطة المنعقدة، ولا يغير الميزانية الافتراضية لحسابك ولا أي دورات سابقة أو قادمة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 4 (UX): APP APPEARANCE & THEME (المظهر والسمة)
           ======================================================== */}
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-muted/15">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  مظهر التطبيق والسمة
                </CardTitle>
                <CardDescription className="text-xs">
                  التبديل بين الوضع الفاتح والوضع الليلي الداكن
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-xs sm:text-sm text-text-secondary">
              تغيير سمة واجهة مصروفي:
            </span>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>

      {/* Edit Default Budget Modal */}
      <EditDefaultBudgetModal
        isOpen={isDefaultBudgetModalOpen}
        onClose={() => setIsDefaultBudgetModalOpen(false)}
        onSuccess={() => {
          loadCycle();
        }}
      />

      {/* Edit Current Cycle Budget Modal */}
      <EditCycleBudgetModal
        isOpen={isCycleBudgetModalOpen}
        onClose={() => setIsCycleBudgetModalOpen(false)}
        initialAmount={currentCycle?.budgetAmount ?? user?.defaultBudgetAmount ?? 5000}
        cycleId={currentCycle?.id}
        onSuccess={() => {
          loadCycle();
        }}
      />
    </div>
  );
}
