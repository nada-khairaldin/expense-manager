"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { DailySpendingPoint } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";

export interface SpendingChartProps {
  data: DailySpendingPoint[];
  periodLabel: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const value = payload[0].value;
    return (
      <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-brand-teal font-bold">{formatCurrency(value)}</p>
      </div>
    );
  }
  return null;
}

export function SpendingChart({ data, periodLabel }: SpendingChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";
  const barColor = isDark ? "#1EB995" : "#16856B";
  const gridColor = isDark ? "#23354E" : "#E2E8F0";
  const axisColor = isDark ? "#94A3B8" : "#5A6A80";

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-teal" />
            <span>توزيع الإنفاق حسب الفترات</span>
          </CardTitle>
          <CardDescription>
            متابعة وتيرة المصروفات عبر فترات {periodLabel}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[280px] pt-2">
        {!mounted ? (
          <div className="w-full h-[280px] rounded-xl bg-surface-muted/50 animate-pulse flex items-center justify-center text-xs text-text-muted">
            جاري تهيئة الرسم البياني...
          </div>
        ) : (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="dayLabel"
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => `₪ ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  fill={barColor}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
