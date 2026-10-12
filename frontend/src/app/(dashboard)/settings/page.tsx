import Link from "next/link";
import { ArrowRight, Shield, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { defaultCurrency } from "@/config/currency";

export default function SettingsPlaceholderPage() {
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
        {/* Quick Theme Setting (Functional right now!) */}
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

        {/* Currency & Budget Preferences (Overview) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-gold" />
              <span>إعدادات العملة ودورة الميزانية</span>
            </CardTitle>
            <CardDescription>
              العملة المركزية المعتمدة حاليًا في كامل التطبيق
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-2 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-primary dark:text-foreground">
                  العملة الافتراضية:
                </span>
                <span className="font-bold text-brand-teal">
                  {defaultCurrency.nameAr} ({defaultCurrency.code} - {defaultCurrency.symbol})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                <span className="font-semibold text-brand-primary dark:text-foreground">
                  تاريخ بدء دورة الميزانية:
                </span>
                <span className="text-text-muted">
                  يوم 1 من كل شهر تقويمي
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة إلى لوحة التحكم</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
