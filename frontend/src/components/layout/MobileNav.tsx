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
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border pt-1.5 pb-safe px-2 transition-colors select-none shadow-lg"
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
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] py-1 px-1.5 rounded-xl text-[10px] font-semibold transition-all relative active:scale-95 touch-manipulation",
                isActive
                  ? "text-brand-teal dark:text-brand-teal font-extrabold"
                  : "text-text-muted hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl mb-0.5 transition-colors relative flex items-center justify-center",
                  isActive
                    ? "bg-brand-teal/15 dark:bg-brand-teal/25 text-brand-teal"
                    : "bg-transparent text-text-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-brand-teal" />
                )}
              </div>
              <span className="truncate max-w-[58px] text-center leading-none mt-0.5">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
