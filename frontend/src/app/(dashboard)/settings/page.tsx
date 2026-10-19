"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Moon,
  User as UserIcon,
  Edit3,
  CheckCircle2,
  Wallet,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/AuthContext";
import { getCurrentBudgetCycleApi } from "@/features/auth/api";
import { type BudgetCycle } from "@/features/auth/types";
import { EditDefaultBudgetModal } from "@/components/budget/EditDefaultBudgetModal";
import { EditCycleBudgetModal } from "@/components/budget/EditCycleBudgetModal";

const CURRENCY_NAMES: Record<string, { nameAr: string; symbol: string }> = {
  ILS: { nameAr: "شيكل إسرائيلي جديد", symbol: "₪" },
  USD: { nameAr: "دولار أمريكي", symbol: "$" },
  JOD: { nameAr: "دينار أردني", symbol: "د.أ" },
  EUR: { nameAr: "يورو أوروبي", symbol: "€" },
};

export default function SettingsPage() {
  const { user, token } = useAuth();

  const [currentCycle, setCurrentCycle] = React.useState<BudgetCycle | null>(null);
  const [isDefaultBudgetModalOpen, setIsDefaultBudgetModalOpen] = React.useState(false);
  const [isCycleBudgetModalOpen, setIsCycleBudgetModalOpen] = React.useState(false);

  const currentCurrencyCode = user?.currency || "ILS";
  const currencyInfo = CURRENCY_NAMES[currentCurrencyCode] || {
    nameAr: currentCurrencyCode,
    symbol: currentCurrencyCode,
  };
  const renewalDay = user?.budgetRenewalDay || 1;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary dark:text-foreground">
            الإعدادات والتفضيلات
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            إدارة الميزانية الافتراضية، دورة الميزانية، العملة، والحساب
          </p>
        </div>

        <Badge variant="neutral" size="md">
          إعدادات النظام
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* User Account Details */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-brand-primary dark:text-foreground" />
                <span>بيانات الحساب</span>
              </CardTitle>
              <CardDescription>
                معلومات الحساب المسجلة على خادم مصروفي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              <div className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-secondary">الاسم الكامل:</span>
                  <span className="font-bold text-brand-primary dark:text-foreground">
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                  <span className="font-semibold text-text-secondary">البريد الإلكتروني:</span>
                  <span className="font-mono text-brand-primary dark:text-foreground dir-ltr">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                  <span className="font-semibold text-text-secondary">حالة إعداد الميزانية:</span>
                  <span className="inline-flex items-center gap-1.5 text-status-success font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>مكتمل ومفعل</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Currency & Budget Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-gold" />
              <span>إعدادات العملة وخطة الميزانية</span>
            </CardTitle>
            <CardDescription>
              العملة المركزية، يوم التجديد، والميزانيات المعتمدة لدوراتك
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-3 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-primary dark:text-foreground">
                  العملة المعتمدة:
                </span>
                <span className="font-bold text-brand-teal">
                  {currencyInfo.nameAr} ({currentCurrencyCode} - {currencyInfo.symbol})
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <span className="font-semibold text-brand-primary dark:text-foreground">
                  يوم بدء دورة الميزانية:
                </span>
                <span className="font-bold text-brand-primary dark:text-foreground">
                  اليوم {renewalDay} من كل شهر تقويمي
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div>
                  <span className="font-semibold text-brand-primary dark:text-foreground block">
                    الميزانية الشهرية الافتراضية:
                  </span>
                  <span className="text-[11px] text-text-muted">
                    تُطبق تلقائياً على كل دورة جديدة وتحدث الدورة النشطة
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-brand-teal">
                  {defaultBudget !== null
                    ? `${defaultBudget.toLocaleString()} ${currencyInfo.symbol}`
                    : "غير محددة"}
                </span>
              </div>

              {currentCycle && (
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                  <div>
                    <span className="font-semibold text-brand-primary dark:text-foreground block">
                      ميزانية الدورة النشطة الحالية:
                    </span>
                    <span className="text-[11px] text-text-muted">
                      مخصصة للدورة الحالية (حتى {new Date(currentCycle.endDate).toLocaleDateString("ar-EG")})
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-brand-primary dark:text-foreground">
                    {currentCycle.budgetAmount.toLocaleString()} {currencyInfo.symbol}
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تعديل الميزانية الافتراضية</span>
                </button>

                {/* Action 2: Edit Current Cycle Budget */}
                <button
                  type="button"
                  onClick={() => setIsCycleBudgetModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover transition-all shadow-sm"
                >
                  <Wallet className="w-4 h-4" />
                  <span>تعديل ميزانية الدورة الحالية فقط</span>
                </button>
              </div>

              {/* Explanatory callout showing differences */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-muted/20 text-[11px] text-text-secondary leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-brand-primary dark:text-foreground">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-teal" />
                  <span>الفرق بين الإجرائين:</span>
                </div>
                <p>
                  • <strong>الميزانية الافتراضية:</strong> يحفظ القيمة الافتراضية الجديدة، ويحدث فوراً ميزانية الدورة الحالية النشطة، ويُطبق على جميع الدورات المستقبلية.
                </p>
                <p>
                  • <strong>ميزانية الدورة الحالية:</strong> يخص فقط الدورة الحالية النشطة، ولا يغير الميزانية الافتراضية لحسابك ولا أي دورات سابقة أو قادمة.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/budget-setup?edit=true"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-muted text-xs font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل العملة ويوم بدء الدورة</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-muted text-xs font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>العودة إلى لوحة التحكم</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Theme Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-brand-teal" />
              <span>مظهر التطبيق والسمة</span>
            </CardTitle>
            <CardDescription>
              التبديل بين الوضع الفاتح والوضع الليلي الداكن
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-1">
            <span className="text-xs text-text-secondary">
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
