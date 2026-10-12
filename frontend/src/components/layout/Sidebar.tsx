"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  BarChart3,
  Settings,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Receipt,
  FolderTree,
  BarChart3,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 border-s border-border bg-surface shrink-0 h-screen sticky top-0 z-30 transition-all select-none"
      aria-label="القائمة الجانبية الرئيسية"
    >
      {/* Brand Identity */}
      <div className="h-16 flex items-center px-6 border-b border-border/80">
        <Link href="/dashboard" className="flex items-center group">
          <Logo variant="horizontal" size="md" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-text-muted tracking-wider">
          التنقل السريع
        </div>

        {siteConfig.navItems.map((item) => {
          const Icon = iconMap[item.iconName] ?? LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "bg-brand-primary text-white shadow-sm dark:bg-brand-teal dark:text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  isActive ? "text-brand-gold dark:text-white" : "text-text-muted group-hover:text-text-primary"
                )}
              />
              <span className="flex-1">{item.title}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold dark:bg-white" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer Info Card */}
      <div className="p-4 border-t border-border/80 m-3 rounded-2xl bg-surface-muted/60 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-primary dark:text-foreground">
          <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
          <span>الميزانية آمنة</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          نظام مصروفي يساعدك في تتبع نفقات العائلة وفق دورة مالية واضحة.
        </p>
      </div>
    </aside>
  );
}
