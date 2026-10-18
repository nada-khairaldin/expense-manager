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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        hint="كافة التصنيفات المتاحة لتوزيع المصروفات"
      />

      {/* 2. التصنيفات ذات حدود الإنفاق */}
      <StatCard
        title="التصنيفات ذات حدود الإنفاق"
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
        hint="تصنيفات تخضع لرقابة ميزانية شهرية محددة"
      />

      {/* 3. التصنيفات التي اقتربت من حد الإنفاق */}
      <StatCard
        title="التصنيفات التي اقتربت من حد الإنفاق"
        value={String(summary.categoriesApproachingLimit)}
        secondaryValue={
          summary.categoriesExceededLimit > 0
            ? `(منها ${summary.categoriesExceededLimit} تجاوزت الحد)`
            : undefined
        }
        icon={AlertTriangle}
        iconColorClass={hasAlerts ? "text-status-warning" : "text-brand-teal"}
        iconBgClass={
          hasAlerts ? "bg-status-warning-bg" : "bg-brand-teal-light dark:bg-brand-teal/20"
        }
        badge={
          <Badge variant={hasAlerts ? "warning" : "success"} size="sm" dot>
            {hasAlerts ? "استهلاك مرتفع (≥85%)" : "كل الحدود آمنة"}
          </Badge>
        }
        hint="استهلكت 85% أو أكثر من الحد المالي المخصص"
      />
    </div>
  );
}
