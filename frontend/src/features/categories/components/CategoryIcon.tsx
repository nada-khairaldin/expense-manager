import * as React from "react";
import {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  GraduationCap,
  BookOpen,
  Phone,
  Zap,
  Fuel,
  ShoppingBag,
  Baby,
  Gift,
  Plane,
  Briefcase,
  Dumbbell,
  Coffee,
  Film,
  Wrench,
  Shield,
  Layers,
  Wallet,
  Coins,
  Receipt,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AVAILABLE_ICONS: Record<
  string,
  { icon: LucideIcon; labelAr: string; categoryAr: string }
> = {
  ShoppingCart: { icon: ShoppingCart, labelAr: "بقالة وتموين", categoryAr: "معيشة" },
  Home: { icon: Home, labelAr: "سكن وفواتير", categoryAr: "معيشة" },
  Car: { icon: Car, labelAr: "مواصلات وسيارة", categoryAr: "نقل" },
  Fuel: { icon: Fuel, labelAr: "وقود ومحروقات", categoryAr: "نقل" },
  Utensils: { icon: Utensils, labelAr: "مطاعم وأغذية", categoryAr: "معيشة" },
  Coffee: { icon: Coffee, labelAr: "كافيهات ومشروبات", categoryAr: "ترفيه" },
  HeartPulse: { icon: HeartPulse, labelAr: "صحة وطب", categoryAr: "صحة" },
  GraduationCap: { icon: GraduationCap, labelAr: "تعليم وجامعة", categoryAr: "تعليم" },
  BookOpen: { icon: BookOpen, labelAr: "كتب وثقافة", categoryAr: "تعليم" },
  ShoppingBag: { icon: ShoppingBag, labelAr: "تسوق وملابس", categoryAr: "مقتنيات" },
  Phone: { icon: Phone, labelAr: "اتصالات وإنترنت", categoryAr: "خدمات" },
  Zap: { icon: Zap, labelAr: "كهرباء وطاقة", categoryAr: "خدمات" },
  Wrench: { icon: Wrench, labelAr: "صيانة وأدوات", categoryAr: "خدمات" },
  Baby: { icon: Baby, labelAr: "أطفال ومستلزمات", categoryAr: "عائلة" },
  Gift: { icon: Gift, labelAr: "هدايا ومناسبات", categoryAr: "عائلة" },
  Plane: { icon: Plane, labelAr: "سفر وسياحة", categoryAr: "ترفيه" },
  Film: { icon: Film, labelAr: "سينما وترفيه", categoryAr: "ترفيه" },
  Dumbbell: { icon: Dumbbell, labelAr: "رياضة ولياقة", categoryAr: "صحة" },
  Briefcase: { icon: Briefcase, labelAr: "عمل واستثمار", categoryAr: "أعمال" },
  Wallet: { icon: Wallet, labelAr: "محفظة ونقد", categoryAr: "مالية" },
  Coins: { icon: Coins, labelAr: "ادخار وفراطة", categoryAr: "مالية" },
  Receipt: { icon: Receipt, labelAr: "فواتير ومستندات", categoryAr: "خدمات" },
  Shield: { icon: Shield, labelAr: "تأمين وحماية", categoryAr: "أعمال" },
  Layers: { icon: Layers, labelAr: "متفرقات أخرى", categoryAr: "أخرى" },
};

export const AVAILABLE_COLORS = [
  { hex: "#16856B", nameAr: "تركواز مالي" },
  { hex: "#D5A64A", nameAr: "ذهبي هادئ" },
  { hex: "#14263D", nameAr: "كحلي رصين" },
  { hex: "#3B82F6", nameAr: "أزرق سماوي" },
  { hex: "#EC4899", nameAr: "وردي حيوي" },
  { hex: "#10B981", nameAr: "زمردي طبيعي" },
  { hex: "#8B5CF6", nameAr: "بنفسجي ملكي" },
  { hex: "#F59E0B", nameAr: "عنبري دافئ" },
  { hex: "#06B6D4", nameAr: "سماوي ساطع" },
  { hex: "#64748B", nameAr: "رمادي أردوازي" },
];

export function getCategoryIconComponent(iconName: string): LucideIcon {
  return AVAILABLE_ICONS[iconName]?.icon ?? Layers;
}

export interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function CategoryIcon({
  iconName,
  color = "#16856B",
  size = "md",
  className,
}: CategoryIconProps) {
  const iconItem = AVAILABLE_ICONS[iconName] ?? AVAILABLE_ICONS.Layers;

  const sizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
    xl: "w-14 h-14 rounded-2xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 transition-transform",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}18`, // 10% opacity tint
        color: color,
        border: `1px solid ${color}30`,
      }}
      aria-hidden="true"
    >
      {React.createElement(iconItem.icon, { className: iconSizes[size] })}
    </div>
  );
}
