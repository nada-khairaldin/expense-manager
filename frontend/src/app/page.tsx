"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/AuthContext";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Sparkles,
  PieChart,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-brand-teal selection:text-white">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo variant="horizontal" size="md" />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <Link
                    href={user.budgetSetupCompleted ? "/dashboard" : "/budget-setup"}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal text-white text-xs sm:text-sm font-semibold hover:opacity-90 shadow-sm transition-all"
                  >
                    <span>لوحة التحكم</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-semibold text-text-primary hover:bg-surface-muted transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>تسجيل الدخول</span>
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">إنشاء حساب</span>
                      <span className="sm:hidden">تسجيل</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal/10 dark:bg-brand-teal/20 border border-brand-teal/20 text-brand-teal text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>نظام إدارة الميزانية الشخصية والعائلية الذكي</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-brand-primary dark:text-foreground tracking-tight max-w-3xl leading-tight sm:leading-snug">
          تحكم في نفقاتك الشهرية وابنِ استقرارك المالي مع{" "}
          <span className="text-brand-teal">مصروفي</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
          تتبع دقيق للمصروفات وفق دورة مالية شهرية مخصصة، إشعارات ذكية لحدود الإنفاق، وتقارير تفصيلية
          تمنحك رؤية واضحة وشاملة لأموالك.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {isAuthenticated && user ? (
            <Link
              href={user.budgetSetupCompleted ? "/dashboard" : "/budget-setup"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand-teal text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <span>الانتقال إلى لوحة التحكم</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold shadow-md transition-all active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>ابدأ الآن مجاناً</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-surface text-text-primary text-sm font-bold hover:bg-surface-muted transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول إلى حسابك</span>
              </Link>
            </>
          )}
        </div>

        {/* Value Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-start">
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-brand-primary dark:text-foreground">
              دورة ميزانية مرنة
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              حدد يوم تجديد دورتك الشهرية وفق موعد استلام راتبك من 1 إلى 31 من كل شهر.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/10 dark:bg-brand-gold/20 text-brand-gold flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-brand-primary dark:text-foreground">
              تصنيفات وحدود إنفاق
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              وزع نفقاتك على تصنيفات مخصصة مع مراقبة حية لنسب الاستهلاك وسقوف الصرف.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-foreground flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-brand-primary dark:text-foreground">
              أمان وموثوقية عالية
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              جلسات مشفرة وتخزين آمن لبياناتك المالية لحماية خصوصيتك ومعلوماتك.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
        <p>جميع الحقوق محفوظة © 2026 — {siteConfig.name} ({siteConfig.nameEn})</p>
      </footer>
    </div>
  );
}
