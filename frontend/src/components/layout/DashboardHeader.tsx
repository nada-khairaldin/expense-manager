"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Logo } from "@/components/shared/Logo";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export interface DashboardHeaderProps {
  onOpenAddExpense: () => void;
}

export function DashboardHeader({ onOpenAddExpense }: DashboardHeaderProps) {
  const pathname = usePathname();

  // Find active item
  const activeItem = siteConfig.navItems.find((item) => item.href === pathname) ?? {
    title: "لوحة التحكم",
    description: "نظرة عامة على الدخل والمصروفات وحالة الميزانية",
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-surface/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Mobile Brand indicator */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center">
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

      {/* Actions: Add Expense & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 ms-auto">
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مصروف</span>
          <span className="sm:hidden">مصروف</span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
