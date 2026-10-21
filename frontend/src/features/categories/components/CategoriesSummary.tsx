"use client";

import * as React from "react";
import { FolderTree, ShieldCheck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { CategoriesSummaryData } from "../types";

export interface CategoriesSummaryProps {
  summary: CategoriesSummaryData;
}

export function CategoriesSummary({ summary }: CategoriesSummaryProps) {
  const limitCoveragePercent =
    summary.totalCategories > 0
      ? Math.round((summary.categoriesWithLimit / summary.totalCategories) * 100)
      : 0;

  const hasAlerts = summary.categoriesApproachingLimit > 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
      {/* 1. إجمالي التصنيفات */}
      <StatCard
        title="إجمالي التصنيفات"
        value={String(summary.totalCategories)}
        secondaryValue="تصنيف"
        icon={FolderTree}
        iconColorClass="text-brand-primary dark:text-foreground"
        iconBgClass="bg-brand-primary/10 dark:bg-brand-primary/30"
        badge={
          <Badge variant="primary" size="sm">
            شاملة
          </Badge>
        }
        hint="كافة التصنيفات المتاحة"
        className="p-3.5 sm:p-5"
      />

      {/* 2. التصنيفات ذات حدود الإنفاق */}
      <StatCard
        title="ذات حدود إنفاق"
        value={String(summary.categoriesWithLimit)}
        secondaryValue={`(${limitCoveragePercent}%)`}
        icon={ShieldCheck}
        iconColorClass="text-brand-teal"
        iconBgClass="bg-brand-teal-light dark:bg-brand-teal/20"
        badge={
          <Badge variant="success" size="sm">
            مقيدة بسقف
          </Badge>
        }
        hint="تخضع لرقابة ميزانية شهرية"
        className="p-3.5 sm:p-5"
      />

      {/* 3. التصنيفات التي اقتربت من حد الإنفاق */}
      <StatCard
        title="اقتربت من حد الإنفاق"
        value={String(summary.categoriesApproachingLimit)}
        secondaryValue={
          summary.categoriesExceededLimit > 0
            ? `(${summary.categoriesExceededLimit} تجاوزت)`
            : undefined
        }
        icon={AlertTriangle}
        iconColorClass={hasAlerts ? "text-status-warning" : "text-brand-teal"}
        iconBgClass={
          hasAlerts ? "bg-status-warning-bg" : "bg-brand-teal-light dark:bg-brand-teal/20"
        }
        badge={
          <Badge variant={hasAlerts ? "warning" : "success"} size="sm" dot>
            {hasAlerts ? "استهلاك مرتفع" : "آمنة"}
          </Badge>
        }
        hint="استهلكت ≥85% من سقف الميزانية"
        className="col-span-2 sm:col-span-1 p-3.5 sm:p-5"
      />
    </div>
  );
}
