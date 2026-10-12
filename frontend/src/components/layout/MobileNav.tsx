"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Receipt,
  FolderTree,
  BarChart3,
  Settings,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border py-2 px-2 transition-colors select-none"
      aria-label="شريط التنقل السفلي للهواتف"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {siteConfig.navItems.map((item) => {
          const Icon = iconMap[item.iconName] ?? LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all relative",
                isActive
                  ? "text-brand-teal dark:text-brand-teal font-bold"
                  : "text-text-muted hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg mb-0.5 transition-colors",
                  isActive
                    ? "bg-brand-teal/10 dark:bg-brand-teal/20"
                    : "bg-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[55px] text-center">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
