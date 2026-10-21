"use client";

import * as React from "react";
import { useExpenses } from "@/features/expenses/useExpenses";
import type { Expense, ExpenseFilters } from "@/features/expenses/types";
import { ExpenseCard } from "@/features/expenses/components/ExpenseCard";
import { ExpenseFormModal } from "@/features/expenses/components/ExpenseFormModal";
import { DeleteExpenseDialog } from "@/features/expenses/components/DeleteExpenseDialog";
import { ExpensesToolbar } from "@/features/expenses/components/ExpensesToolbar";
import { ExpensesSummaryCards } from "@/features/expenses/components/ExpensesSummaryCards";
import { EmptyExpensesState } from "@/features/expenses/components/EmptyExpensesState";
import { ExpenseSkeleton } from "@/features/expenses/components/ExpenseSkeleton";
import {
  Receipt,
  Plus,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function ExpensesPage() {
  // Filters and pagination state
  const [filters, setFilters] = React.useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    sortBy: "date",
    order: "desc",
  });

  // Query hook with live backend data
  const {
    expenses,
    pagination,
    totalAmount,
    isLoading,
    isError,
    error,
    refetch,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses(filters);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null);

  const handleFilterChange = (newFilters: Partial<ExpenseFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "date",
      order: "desc",
    });
  };

  const handleOpenCreate = () => {
    setExpenseToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  const isFiltered = Boolean(
    filters.categoryId ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount !== undefined ||
      filters.maxAmount !== undefined
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Add Expense Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-primary dark:text-foreground">
              سجل المصروفات
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold">
              {pagination.total} حركة مسجلة
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            متابعة شاملة لجميع المصروفات اليومية مع خيارات التصفية والفرز والتقسيم
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover active:scale-95 transition-all inline-flex items-center justify-center gap-2 shadow-sm touch-manipulation shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مصروف جديد</span>
        </button>
      </div>

      {/* 2. Financial Summary Cards for Current View */}
      <ExpensesSummaryCards
        totalAmount={totalAmount}
        totalTransactions={pagination.total}
      />

      {/* 3. Toolbar with Search, Filters, and Sorting */}
      <ExpensesToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* 4. Content Area: Loading / Error / Empty / List */}
      {isLoading ? (
        <ExpenseSkeleton />
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-status-danger/20 bg-status-danger-bg/20 space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary">
              تعذر تحميل بيانات المصروفات
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              {error || "حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors inline-flex items-center gap-2 touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <EmptyExpensesState
          isFiltered={isFiltered}
          onClearFilters={handleClearFilters}
          onAddExpense={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {/* List of Expense Cards */}
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          {/* 5. Mobile-first Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
              <span className="text-xs text-text-muted text-center sm:text-start">
                عرض الصفحة <strong>{pagination.page}</strong> من إجمالي{" "}
                <strong>{pagination.totalPages}</strong> صفحة ({pagination.total} حركة)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    handleFilterChange({ page: Math.max(1, pagination.page - 1) })
                  }
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-text-primary hover:bg-surface-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all inline-flex items-center gap-1.5 touch-manipulation"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-0" />
                  <span>السابق</span>
                </button>

                <div className="px-3 py-2 text-xs font-bold text-brand-primary dark:text-foreground">
                  {pagination.page} / {pagination.totalPages}
                </div>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    handleFilterChange({
                      page: Math.min(pagination.totalPages, pagination.page + 1),
                    })
                  }
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-text-primary hover:bg-surface-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all inline-flex items-center gap-1.5 touch-manipulation"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Form Modal for Add and Edit */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        onSubmitCreate={createExpense}
        onSubmitUpdate={updateExpense}
      />

      {/* 7. Confirmation Dialog for Safe Deletion */}
      <DeleteExpenseDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        expense={expenseToDelete}
        onConfirmDelete={deleteExpense}
      />
    </div>
  );
}
