"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Logo } from "@/components/shared/Logo";
import { PlusCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

export interface DashboardHeaderProps {
  onOpenAddExpense: () => void;
}

export function DashboardHeader({ onOpenAddExpense }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Find active item
  const activeItem = siteConfig.navItems.find((item) => item.href === pathname) ?? {
    title: "لوحة التحكم",
    description: "نظرة عامة على الميزانية والمصروفات وحالة الإنفاق",
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-surface/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors pt-safe">
      {/* Mobile Brand indicator */}
      <div className="flex items-center gap-2 lg:hidden">
        <Link href="/dashboard" className="flex items-center active:scale-95 transition-all">
          <Logo variant="horizontal" size="sm" />
        </Link>
      </div>

      {/* Desktop Page Title & Context */}
      <div className="hidden lg:flex flex-col">
        <h1 className="text-base font-bold text-brand-primary dark:text-foreground leading-tight">
          {activeItem.title}
        </h1>
        {activeItem.description && (
          <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
            {activeItem.description}
          </p>
        )}
      </div>

      {/* Actions: Add Expense, User, Theme Toggle & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 ms-auto">
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 h-10 rounded-xl bg-brand-teal text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-brand-teal"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مصروف</span>
          <span className="sm:hidden">مصروف</span>
        </button>

        {user && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 h-10 rounded-xl bg-surface-muted/60 border border-border text-xs text-brand-primary dark:text-foreground font-semibold">
            <div className="w-6 h-6 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/30 flex items-center justify-center text-brand-primary dark:text-foreground text-[11px] font-bold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <span className="max-w-[120px] truncate">{user.name}</span>
          </div>
        )}

        <div className="h-10 flex items-center">
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-border text-text-muted hover:text-status-danger hover:border-status-danger/30 hover:bg-status-danger-bg flex items-center justify-center active:scale-95 transition-all touch-manipulation"
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
