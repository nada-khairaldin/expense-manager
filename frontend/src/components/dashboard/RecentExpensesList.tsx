import Link from "next/link";
import { ExpenseItem } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Receipt,
  ArrowLeft,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Layers,
  LucideIcon,
  Inbox,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Layers,
};

export interface RecentExpensesListProps {
  expenses: ExpenseItem[];
}

export function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-teal" />
            <span>آخر العمليات والمصروفات</span>
          </CardTitle>
          <CardDescription>
            أحدث الحركات المالية المسجلة في هذه الدورة
          </CardDescription>
        </div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="pt-1 flex-1">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted space-y-2">
            <Inbox className="w-8 h-8 opacity-40" />
            <p className="text-xs">لا توجد مصروفات مسجلة لهذه الفترة حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {expenses.map((expense) => {
              const iconKey = expense.categoryIcon || "Receipt";
              const IconComponent = iconMap[iconKey] ?? Layers;
              const color = expense.categoryColor || "#16856B";
              return (
                <div
                  key={expense.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {expense.description || expense.categoryName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                        <span>{expense.categoryName}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-xs font-bold text-brand-primary dark:text-foreground">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
