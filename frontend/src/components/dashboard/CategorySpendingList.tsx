import { CategoryBudget } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  FolderTree,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Layers,
  LucideIcon,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Layers,
};

export interface CategorySpendingListProps {
  categories: CategoryBudget[];
}

export function CategorySpendingList({ categories }: CategorySpendingListProps) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand-teal" />
            <span>إنفاق التصنيفات وسقوف الميزانية</span>
          </CardTitle>
          <span className="text-xs text-text-muted">
            {categories.length} تصنيفات نشطة
          </span>
        </div>
        <CardDescription>
          متابعة استهلاك الحدود المالية المخصصة لكل تصنيف
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 flex-1">
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
          const IconComponent = iconMap[cat.icon] ?? Layers;
          const hasLimit = typeof cat.limit === "number";

          // Threshold evaluation
          let statusBadge = null;
          let progressBg = "bg-brand-teal";

          if (hasLimit && cat.percentage !== null) {
            if (cat.percentage >= 100) {
              progressBg = "bg-status-danger";
              statusBadge = (
                <Badge variant="danger" size="sm" dot>
                  <AlertCircle className="w-3 h-3 me-1 inline-block" />
                  تجاوز الحد
                </Badge>
              );
            } else if (cat.percentage >= 95) {
              progressBg = "bg-status-danger";
              statusBadge = (
                <Badge variant="danger" size="sm" dot>
                  <AlertTriangle className="w-3 h-3 me-1 inline-block" />
                  حرج ({cat.percentage.toFixed(0)}%)
                </Badge>
              );
            } else if (cat.percentage >= 85) {
              progressBg = "bg-status-warning";
              statusBadge = (
                <Badge variant="warning" size="sm" dot>
                  <AlertTriangle className="w-3 h-3 me-1 inline-block" />
                  تحذير ({cat.percentage.toFixed(0)}%)
                </Badge>
              );
            } else {
              progressBg = "bg-brand-teal";
              statusBadge = (
                <Badge variant="success" size="sm">
                  <CheckCircle className="w-3 h-3 me-1 inline-block" />
                  طبيعي ({cat.percentage.toFixed(0)}%)
                </Badge>
              );
            }
          } else {
            statusBadge = (
              <Badge variant="neutral" size="sm">
                بدون سقف
              </Badge>
            );
          }

          return (
            <div
              key={cat.id}
              className="p-3 rounded-xl border border-border-subtle bg-surface-muted/30 hover:bg-surface-muted/60 transition-colors space-y-2"
            >
              {/* Category Info Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary">
                      {cat.name}
                    </span>
                    <div className="text-[11px] text-text-muted">
                      {hasLimit ? `السقف: ${formatCurrency(cat.limit!)}` : "لا يوجد سقف محدد"}
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <div className="text-xs font-bold text-brand-primary dark:text-foreground">
                    {formatCurrency(cat.spent)}
                  </div>
                  <div className="mt-0.5">{statusBadge}</div>
                </div>
              </div>

              {/* Progress bar if category has limit */}
              {hasLimit && cat.percentage !== null && (
                <div className="space-y-1 pt-0.5">
                  <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                      style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                      role="progressbar"
                      aria-valuenow={cat.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }))}
      </CardContent>
    </Card>
  );
}
