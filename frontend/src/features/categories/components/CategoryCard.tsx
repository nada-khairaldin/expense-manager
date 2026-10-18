"use client";

import * as React from "react";
import {
  MoreVertical,
  Pencil,
  Sliders,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Receipt,
} from "lucide-react";
import { CategoryItem } from "../types";
import {
  calculateSpendingPercentage,
  getCategoryStatus,
  getCategoryRemaining,
} from "../utils/categoryCalculations";
import { CategoryIcon } from "./CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  category: CategoryItem;
  onEdit: (category: CategoryItem) => void;
  onEditLimit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onEditLimit,
  onDelete,
}: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close contextual menu on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const hasLimit = category.limit !== null && category.limit !== undefined && category.limit > 0;
  const hasSpent = category.spent !== null && category.spent !== undefined;
  const status = getCategoryStatus(category.spent, category.limit);
  const percentage = calculateSpendingPercentage(category.spent, category.limit);
  const remainingData = getCategoryRemaining(category.spent, category.limit);

  // Determine status badge and progress bar styling
  let statusBadge = null;
  let progressBgColor = "bg-brand-teal";

  if (status === "unavailable") {
    statusBadge = (
      <Badge variant="neutral" size="sm">
        <HelpCircle className="w-3 h-3 me-1 inline-block" />
        غير متوفر
      </Badge>
    );
  } else if (!hasLimit) {
    statusBadge = (
      <Badge variant="neutral" size="sm">
        بدون حد إنفاق
      </Badge>
    );
  } else if (status === "exceeded") {
    progressBgColor = "bg-status-danger";
    statusBadge = (
      <Badge variant="danger" size="sm" dot>
        <AlertCircle className="w-3 h-3 me-1 inline-block" />
        تجاوز الحد ({percentage?.toFixed(0)}%)
      </Badge>
    );
  } else if (status === "warning") {
    // 85% to 100% - critical or warning, but not exceeded!
    progressBgColor = percentage && percentage >= 95 ? "bg-status-danger" : "bg-status-warning";
    statusBadge = (
      <Badge variant="warning" size="sm" dot>
        <AlertTriangle className="w-3 h-3 me-1 inline-block" />
        اقترب من الحد ({percentage?.toFixed(0)}%)
      </Badge>
    );
  } else {
    // normal (< 85%)
    progressBgColor = "bg-brand-teal";
    statusBadge = (
      <Badge variant="success" size="sm">
        <CheckCircle2 className="w-3 h-3 me-1 inline-block" />
        ضمن الحد ({percentage?.toFixed(0)}%)
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border border-border bg-surface text-foreground shadow-sm hover:shadow-md hover:border-brand-teal/40 transition-all",
        status === "exceeded" && "border-status-danger/40 dark:border-status-danger/30"
      )}
    >
      {/* Top row: Category Icon + Title & Contextual Menu */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <CategoryIcon
              iconName={category.icon}
              color={category.color}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-brand-primary dark:text-foreground truncate">
                {category.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {typeof category.transactionCount === "number" ? (
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-text-muted" />
                    <span>
                      {category.transactionCount > 0
                        ? `${category.transactionCount} عملية`
                        : "لا توجد عمليات"}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Contextual Actions Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
              aria-expanded={isMenuOpen}
              aria-label={`خيارات تصنيف ${category.name}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute end-0 top-full mt-1 w-44 rounded-xl border border-border bg-surface p-1 shadow-lg z-20 animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(category);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted rounded-lg transition-colors text-start"
                  role="menuitem"
                >
                  <Pencil className="w-3.5 h-3.5 text-text-muted" />
                  <span>تعديل التصنيف</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEditLimit(category);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted rounded-lg transition-colors text-start"
                  role="menuitem"
                >
                  <Sliders className="w-3.5 h-3.5 text-brand-gold" />
                  <span>تعديل حد الإنفاق</span>
                </button>

                <div className="my-1 border-t border-border-subtle" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(category);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-danger hover:bg-status-danger-bg rounded-lg transition-colors text-start"
                  role="menuitem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف التصنيف</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Short Description */}
        {category.description && (
          <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>

      {/* Middle & Bottom: Financial Figures & Progress */}
      <div className="space-y-3 pt-2 border-t border-border-subtle/80 mt-auto">
        {/* Spending & Limit Numbers */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] text-text-muted mb-0.5">الإنفاق الفعلي</div>
            <div className="text-base font-extrabold tracking-tight text-brand-primary dark:text-foreground">
              {hasSpent ? formatCurrency(category.spent!) : (
                <span className="text-text-muted text-xs font-normal">غير متوفر</span>
              )}
            </div>
          </div>

          <div className="text-end">
            <div className="text-[11px] text-text-muted mb-0.5">الحد المالي</div>
            <div className="text-xs font-bold text-text-secondary">
              {hasLimit ? formatCurrency(category.limit!) : "بدون حد إنفاق"}
            </div>
          </div>
        </div>

        {/* Progress Bar (Only when limit is configured) */}
        {hasLimit && percentage !== null ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">
                {remainingData?.isExceeded ? (
                  <span className="text-status-danger font-semibold">
                    تجاوز بمقدار {formatCurrency(remainingData.amount)}
                  </span>
                ) : (
                  <span>المتبقي: {formatCurrency(remainingData?.amount ?? 0)}</span>
                )}
              </span>
              <span className="font-bold text-text-primary">
                {percentage.toFixed(1)}%
              </span>
            </div>

            {/* Visual Bar Container */}
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden relative">
              <div
                className={cn("h-full rounded-full transition-all duration-500", progressBgColor)}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`نسبة استهلاك ميزانية تصنيف ${category.name}`}
              />
            </div>
          </div>
        ) : null}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-text-muted">حالة الميزانية:</span>
          <div>{statusBadge}</div>
        </div>
      </div>
    </div>
  );
}
