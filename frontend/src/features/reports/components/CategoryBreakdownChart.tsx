"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { PieChart as PieIcon, HelpCircle, Archive, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import type { CategoryBreakdownItem } from "../types";

interface CategoryBreakdownChartProps {
  categories: CategoryBreakdownItem[];
  totalSpending: number;
  currency?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryBreakdownItem }>;
}

function CategoryCustomTooltip({ active, payload, currency }: CustomTooltipProps & { currency?: string }) {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1.5 min-w-[160px]">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-text-primary">{item.name}</span>
        </div>
        <div className="text-text-secondary text-[11px] space-y-0.5">
          <p>
            المبلغ:{" "}
            <span className="font-semibold text-text-primary">
              {formatCurrency(item.totalAmount, { currencyCode: currency })}
            </span>
          </p>
          <p>
            النسبة من الإجمالي:{" "}
            <span className="font-semibold text-brand-teal">
              {item.percentage}%
            </span>
          </p>
          <p>
            عدد المعاملات:{" "}
            <span className="font-semibold text-text-primary">
              {item.expenseCount}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function CategoryBreakdownChart({
  categories,
  totalSpending,
  currency,
}: CategoryBreakdownChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  if (categories.length === 0 || totalSpending === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieIcon className="w-4 h-4 text-brand-teal" />
            <span>توزيع النفقات حسب التصنيف</span>
          </CardTitle>
          <CardDescription>
            نسبة إنفاق كل فئة وتصنيف مالي
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
          <HelpCircle className="w-10 h-10 stroke-[1.5] text-text-secondary/50 mb-2" />
          <p className="text-sm font-semibold text-text-primary">لا توجد نفقات مسجلة</p>
          <p className="text-xs mt-1">لم يتم تسجيل أي مصروفات في الفترة المحددة لعرض توزيع التصنيفات.</p>
        </CardContent>
      </Card>
    );
  }

  // Pre-sort categories by totalAmount descending
  const sortedCategories = [...categories].sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieIcon className="w-4 h-4 text-brand-teal" />
              <span>توزيع النفقات حسب التصنيف</span>
            </CardTitle>
            <CardDescription className="text-xs">
              توزيع {sortedCategories.length} تصنيفات بإجمالي {formatCurrency(totalSpending, { currencyCode: currency })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Donut Chart with responsive wrapper */}
        <div className="h-56 sm:h-64 w-full relative">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedCategories}
                  dataKey="totalAmount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  animationDuration={600}
                >
                  {sortedCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.categoryId ?? index}-${entry.name}`}
                      fill={entry.color}
                      stroke={isDark ? "#14263D" : "#FFFFFF"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryCustomTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-text-secondary">
              جاري تجهيز الرسم البياني...
            </div>
          )}

          {/* Centered Total inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] text-text-secondary font-medium">الإجمالي</span>
            <span className="text-sm sm:text-base font-bold text-text-primary px-2">
              {formatCurrency(totalSpending, { currencyCode: currency })}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin divide-y divide-border/60">
          {sortedCategories.map((cat, idx) => (
            <div
              key={`${cat.categoryId ?? idx}-${cat.name}`}
              className="flex items-center justify-between py-2 text-xs gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon
                  iconName={cat.icon || "Tag"}
                  color={cat.color}
                  size="sm"
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-text-primary truncate">
                      {cat.name}
                    </span>
                    {cat.isDeleted && (
                      <Badge variant="danger" size="sm" className="text-[10px] py-0 px-1.5 gap-0.5">
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>محذوف سابقاً</span>
                      </Badge>
                    )}
                    {cat.isArchived && (
                      <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5 gap-0.5">
                        <Archive className="w-2.5 h-2.5" />
                        <span>مؤرشف</span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {cat.expenseCount} معاملة ({cat.percentage}%)
                  </span>
                </div>
              </div>

              <div className="text-end shrink-0">
                <span className="font-bold text-text-primary block">
                  {formatCurrency(cat.totalAmount, { currencyCode: currency })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
