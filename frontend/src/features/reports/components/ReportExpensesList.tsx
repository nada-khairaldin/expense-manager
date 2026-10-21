"use client";

import React from "react";
import { Receipt, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import type { ReportExpenseItem } from "../types";

interface ReportExpensesListProps {
  expenses: ReportExpenseItem[];
  currency?: string;
  totalCount: number;
}

export function ReportExpensesList({
  expenses,
  currency,
  totalCount,
}: ReportExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-teal" />
            <span>معاملات الفترة</span>
          </CardTitle>
          <CardDescription className="text-xs">
            أهم المصروفات المسجلة ضمن معايير التقرير الحالية
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-text-secondary">
          لا توجد معاملات مسجلة في هذا النطاق والفلاتر المحددة.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-teal" />
            <span>معاملات الفترة ({totalCount})</span>
          </CardTitle>
          <CardDescription className="text-xs">
            عرض عينة من أهم المصروفات المسجلة وفق معايير التصفية والفرز
          </CardDescription>
        </div>

        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary dark:text-brand-teal hover:underline min-h-[36px]"
        >
          <span>إدارة كافة المصروفات</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="divide-y divide-border/60">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  iconName={expense.categoryIcon || "Tag"}
                  color={expense.categoryColor || "#64748B"}
                  size="sm"
                />
                <div className="truncate space-y-0.5">
                  <p className="font-semibold text-text-primary truncate">
                    {expense.description || expense.categoryName || "مصروف بدون وصف"}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span>{expense.categoryName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(expense.date || expense.expenseDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-end shrink-0">
                <span className="font-bold text-text-primary text-sm">
                  {formatCurrency(expense.amount, { currencyCode: currency })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
