import { defaultCurrency } from "./currency";

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  description?: string;
}

export const siteConfig = {
  name: "مصروفي",
  nameEn: "Masroofi",
  description: "نظام ذكي وشامل لإدارة المصروفات والميزانية الشخصية والعائلية بأسلوب احترافي وموثوق",
  url: "https://masroofi.app",
  direction: "rtl" as const,
  language: "ar" as const,
  currency: defaultCurrency,
  navItems: [
    {
      title: "لوحة التحكم",
      href: "/dashboard",
      iconName: "LayoutDashboard",
      description: "نظرة عامة على الدخل، المصروفات، وحالة الميزانية",
    },
    {
      title: "المصروفات",
      href: "/expenses",
      iconName: "Receipt",
      description: "سجل العمليات والمصروفات اليومية",
    },
    {
      title: "التصنيفات",
      href: "/categories",
      iconName: "FolderTree",
      description: "إدارة وتوزيع تصنيفات الإنفاق",
    },
    {
      title: "التقارير المالية",
      href: "/reports",
      iconName: "BarChart3",
      description: "تحليلات وإحصائيات دورات الميزانية",
    },
    {
      title: "الإعدادات",
      href: "/settings",
      iconName: "Settings",
      description: "تفضيلات الحساب، العملة، والوضع الليلي",
    },
  ] satisfies NavItem[],
  version: "0.1.0",
} as const;

export type SiteConfig = typeof siteConfig;
