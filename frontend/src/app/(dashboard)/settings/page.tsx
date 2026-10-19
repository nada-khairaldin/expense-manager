"use client";

import Link from "next/link";
import { ArrowRight, Shield, Moon, User as UserIcon, Edit3, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/AuthContext";

const CURRENCY_NAMES: Record<string, { nameAr: string; symbol: string }> = {
  ILS: { nameAr: "شيكل إسرائيلي جديد", symbol: "₪" },
  USD: { nameAr: "دولار أمريكي", symbol: "$" },
  JOD: { nameAr: "دينار أردني", symbol: "د.أ" },
  EUR: { nameAr: "يورو أوروبي", symbol: "€" },
};

export default function SettingsPage() {
  const { user } = useAuth();

  const currentCurrencyCode = user?.currency || "ILS";
  const currencyInfo = CURRENCY_NAMES[currentCurrencyCode] || {
    nameAr: currentCurrencyCode,
    symbol: currentCurrencyCode,
  };
  const renewalDay = user?.budgetRenewalDay || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary dark:text-foreground">
            الإعدادات والتفضيلات
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            إعدادات الحساب، العملة، ودورة الميزانية الشهرية
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
              <span>إعدادات العملة ودورة الميزانية</span>
            </CardTitle>
            <CardDescription>
              العملة المركزية ويوم تجديد دورة الميزانية المسجلة في حسابك
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-2 text-xs text-text-secondary">
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
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/budget-setup?edit=true"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل العملة ودورة الميزانية</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-muted text-xs font-medium transition-colors"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة إلى لوحة التحكم</span>
              </Link>
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
    </div>
  );
}
