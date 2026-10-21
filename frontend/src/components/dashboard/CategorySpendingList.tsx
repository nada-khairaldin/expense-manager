"use client";

import React from "react";
import { CategoryBudget } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import {
  FolderTree,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export interface CategorySpendingListProps {
  categories: CategoryBudget[];
  currency?: string;
}

export function CategorySpendingList({ categories, currency }: CategorySpendingListProps) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="w-4 h-4 text-brand-teal" />
            <span>إنفاق التصنيفات وسقوف الميزانية</span>
          </CardTitle>
          <span className="text-xs text-text-muted">
            {categories.length} تصنيفات نشطة
          </span>
        </div>
        <CardDescription className="text-xs">
          متابعة استهلاك الحدود المالية المخصصة لكل تصنيف خلال الدورة
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-1 flex-1 overflow-y-auto max-h-[460px] scrollbar-thin">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-surface-muted/20 my-auto">
            <Layers className="w-8 h-8 text-text-muted mb-2 opacity-60" />
            <p className="text-xs font-bold text-text-primary">لا توجد تصنيفات نشطة حاليًا</p>
            <p className="text-[11px] text-text-muted mt-1">
              أضيفي تصنيفات جديدة من صفحة التصنيفات لمتابعة استهلاك الميزانية.
            </p>
          </div>
        ) : (
          categories.map((cat) => {
            const hasLimit = typeof cat.limit === "number" && cat.limit > 0;
            const percentage = cat.percentage;

            // Threshold evaluation strictly according to Masroofi rules:
            // < 85%: Green (Within limit, no warning)
            // 85% to < 95%: Yellow (Approaching limit)
            // 95% or more: Red (Critical / Exceeded)
            let statusBadge = null;
            let progressBg = "bg-brand-teal";

            if (hasLimit && percentage !== null) {
              if (percentage >= 100) {
                progressBg = "bg-danger-500";
                statusBadge = (
                  <Badge variant="danger" size="sm" dot>
                    <AlertCircle className="w-3 h-3 me-1 inline-block" />
                    تجاوز السقف ({percentage.toFixed(0)}%)
                  </Badge>
                );
              } else if (percentage >= 95) {
                progressBg = "bg-danger-500";
                statusBadge = (
                  <Badge variant="danger" size="sm" dot>
                    <AlertTriangle className="w-3 h-3 me-1 inline-block" />
                    حرج ({percentage.toFixed(0)}%)
                  </Badge>
                );
              } else if (percentage >= 85) {
                progressBg = "bg-amber-500";
                statusBadge = (
                  <Badge variant="warning" size="sm" dot>
                    <AlertTriangle className="w-3 h-3 me-1 inline-block" />
                    قريب من السقف ({percentage.toFixed(0)}%)
                  </Badge>
                );
              } else {
                progressBg = "bg-brand-teal";
                statusBadge = (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 me-1 inline-block" />
                    طبيعي ({percentage.toFixed(0)}%)
                  </Badge>
                );
              }
            } else {
              statusBadge = (
                <Badge variant="neutral" size="sm">
                  بدون سقف محدد
                </Badge>
              );
            }

            return (
              <div
                key={cat.id}
                className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-muted/60 transition-colors space-y-2"
              >
                {/* Category Info Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon
                      iconName={cat.icon || "Layers"}
                      color={cat.color || "#16856B"}
                      size="sm"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-text-primary block truncate">
                        {cat.name}
                      </span>
                      <div className="text-[11px] text-text-secondary">
                        {hasLimit
                          ? `السقف: ${formatCurrency(cat.limit!, { currencyCode: currency })}`
                          : "لا يوجد سقف محدد"}
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-xs font-bold text-brand-primary dark:text-foreground">
                      {formatCurrency(cat.spent, { currencyCode: currency })}
                    </div>
                    <div className="mt-0.5">{statusBadge}</div>
                  </div>
                </div>

                {/* Progress bar displayed ONLY when category has a configured limit */}
                {hasLimit && percentage !== null && (
                  <div className="space-y-1 pt-0.5">
                    <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`استهلاك تصنيف ${cat.name}`}
                      />
                    </div>
                    {cat.remaining !== null && (
                      <div className="flex justify-between items-center text-[10px] text-text-secondary">
                        <span>
                          {cat.remaining < 0
                            ? `تجاوز بمقدار ${formatCurrency(Math.abs(cat.remaining), { currencyCode: currency })}`
                            : `المتبقي: ${formatCurrency(cat.remaining, { currencyCode: currency })}`}
                        </span>
                        <span>{percentage}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
