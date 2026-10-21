"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { TrendingUp, BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import type { TimeSeriesPoint } from "../types";

interface SpendingOverTimeChartProps {
  data: TimeSeriesPoint[];
  interval: "day" | "week" | "month";
  currency?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: TimeSeriesPoint }>;
  currency?: string;
}

function TimeSeriesCustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const point = payload[0].payload;
    return (
      <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-text-primary">{point.label || point.date}</p>
        <p className="text-brand-teal font-bold text-sm">
          {formatCurrency(point.amount, { currencyCode: currency })}
        </p>
        <p className="text-[11px] text-text-secondary">
          {point.count} {point.count === 1 ? "معاملة" : "معاملات"}
        </p>
      </div>
    );
  }
  return null;
}

export function SpendingOverTimeChart({
  data,
  interval,
  currency,
}: SpendingOverTimeChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";
  const lineColor = isDark ? "#1EB995" : "#16856B";
  const gridColor = isDark ? "#23354E" : "#E2E8F0";
  const axisColor = isDark ? "#94A3B8" : "#5A6A80";

  const intervalLabel =
    interval === "day"
      ? "تجميع يومي"
      : interval === "week"
      ? "تجميع أسبوعي"
      : "تجميع شهري";

  const totalChartSpending = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-brand-teal" />
            <span>مسار الإنفاق عبر الزمن</span>
          </CardTitle>
          <CardDescription className="text-xs">
            تطور حجم المصروفات على مدار الفترة المحددة
          </CardDescription>
        </div>

        <Badge variant="neutral" size="sm" className="gap-1 text-[11px]">
          <BarChart2 className="w-3 h-3 text-brand-teal" />
          <span>{intervalLabel}</span>
        </Badge>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 sm:h-72 w-full">
          {mounted ? (
            data.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-text-secondary">
                لا توجد بيانات إنفاق متاحة لهذا النطاق
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={lineColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={lineColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="label"
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<TimeSeriesCustomTooltip currency={currency} />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={lineColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-secondary">
              جاري تجهيز الرسم البياني...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
