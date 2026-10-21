"use client";

import * as React from "react";
import { CategoryItem, SpendingLimitFilter, CategorySortOption } from "@/features/categories/types";
import { useCategories } from "@/features/categories/useCategories";
import {
  computeCategoriesSummary,
  filterAndSortCategories,
} from "@/features/categories/utils/categoryCalculations";
import { CategoriesHeader } from "@/features/categories/components/CategoriesHeader";
import { CategoriesSummary } from "@/features/categories/components/CategoriesSummary";
import { CategoriesToolbar } from "@/features/categories/components/CategoriesToolbar";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { CategoryFormModal } from "@/features/categories/components/CategoryFormModal";
import { QuickEditLimitModal } from "@/features/categories/components/QuickEditLimitModal";
import { DeleteCategoryDialog } from "@/features/categories/components/DeleteCategoryDialog";
import { EmptyCategoriesState } from "@/features/categories/components/EmptyCategoriesState";
import { CategorySkeleton } from "@/features/categories/components/CategorySkeleton";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    isError,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<SpendingLimitFilter>("all");
  const [activeSort, setActiveSort] = React.useState<CategorySortOption>("name");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<CategoryItem | null>(null);

  const [isQuickLimitOpen, setIsQuickLimitOpen] = React.useState(false);
  const [categoryForQuickLimit, setCategoryForQuickLimit] = React.useState<CategoryItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryItem | null>(null);

  // User feedback toast
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = React.useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Summary Overview calculation
  const summary = React.useMemo(() => {
    return computeCategoriesSummary(categories);
  }, [categories]);

  // Filtered and Sorted list
  const filteredCategories = React.useMemo(() => {
    return filterAndSortCategories(categories, searchQuery, activeFilter, activeSort);
  }, [categories, searchQuery, activeFilter, activeSort]);

  // Handler: Create or Update Category
  const handleSaveCategory = async (data: {
    name: string;
    icon: string;
    color: string;
    description?: string;
    limit: number | null;
  }) => {
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, {
          name: data.name,
          icon: data.icon,
          color: data.color,
          description: data.description,
          limit: data.limit,
          monthlyLimit: data.limit,
        });
        showToast(`تم تحديث بيانات تصنيف "${data.name}" بنجاح.`);
      } else {
        await createCategory({
          name: data.name,
          icon: data.icon,
          color: data.color,
          description: data.description,
          limit: data.limit,
          monthlyLimit: data.limit,
        });
        showToast(`تمت إضافة تصنيف "${data.name}" بنجاح.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر حفظ بيانات التصنيف";
      showToast(message, "error");
      throw err;
    }
  };

  // Handler: Quick Update Limit
  const handleUpdateLimit = async (categoryId: string, newLimit: number | null) => {
    try {
      await updateCategory(categoryId, {
        limit: newLimit,
        monthlyLimit: newLimit,
      });
      const catName = categories.find((c) => c.id === categoryId)?.name ?? "";
      showToast(
        newLimit !== null
          ? `تم تحديث سقف ميزانية "${catName}" بنجاح.`
          : `تم إلغاء سقف ميزانية "${catName}".`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تحديث سقف الميزانية";
      showToast(message, "error");
      throw err;
    }
  };

  // Handler: Delete Category
  const handleConfirmDelete = async (categoryId: string) => {
    try {
      const target = categories.find((c) => c.id === categoryId);
      await deleteCategory(categoryId);
      showToast(`تم حذف تصنيف "${target?.name ?? ""}".`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر حذف التصنيف";
      showToast(message, "error");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Action Feedback Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-20 lg:bottom-6 start-4 end-4 sm:start-auto sm:end-6 sm:w-96 z-40 flex items-center gap-3 p-3.5 rounded-2xl border bg-surface text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200",
            toast.type === "error"
              ? "border-status-danger/40 text-status-danger"
              : "border-brand-teal/40 text-brand-primary dark:text-foreground"
          )}
        >
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
              toast.type === "error"
                ? "bg-status-danger/15 text-status-danger"
                : "bg-brand-teal/15 text-brand-teal"
            )}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <CategoriesHeader
        onOpenAddCategory={() => {
          setCategoryToEdit(null);
          setIsFormModalOpen(true);
        }}
        totalCategories={categories.length}
      />

      {/* 2. Summary Overview Cards */}
      <CategoriesSummary summary={summary} />

      {/* 3. Search & Filtering Toolbar */}
      <CategoriesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
        onResetFilters={() => {
          setSearchQuery("");
          setActiveFilter("all");
          setActiveSort("name");
        }}
      />

      {/* 4. Main Category List / States */}
      <div>
        {isLoading && categories.length === 0 ? (
          <CategorySkeleton />
        ) : isError ? (
          <EmptyCategoriesState
            type="error"
            errorMessage={error || undefined}
            onRetry={() => refetch()}
          />
        ) : categories.length === 0 ? (
          <EmptyCategoriesState
            type="no_categories"
            onOpenAddCategory={() => {
              setCategoryToEdit(null);
              setIsFormModalOpen(true);
            }}
          />
        ) : filteredCategories.length === 0 ? (
          <EmptyCategoriesState
            type="no_search_results"
            searchQuery={searchQuery}
            onClearFilters={() => {
              setSearchQuery("");
              setActiveFilter("all");
              setActiveSort("name");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={(cat) => {
                  setCategoryToEdit(cat);
                  setIsFormModalOpen(true);
                }}
                onEditLimit={(cat) => {
                  setCategoryForQuickLimit(cat);
                  setIsQuickLimitOpen(true);
                }}
                onDelete={(cat) => {
                  setCategoryToDelete(cat);
                  setIsDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Contextual Help Notice */}
      <div className="p-4 rounded-2xl border border-border bg-surface-muted/30 text-xs text-text-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-teal shrink-0" />
          <span>
            حدود الإنفاق تتيح لكِ التنبيه الاستباقي عند استهلاك 85% أو أكثر من الميزانية الشهرية المحددة للتصنيف.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-text-muted shrink-0">
          إدارة التصنيفات
        </span>
      </div>

      {/* 6. Dialogs & Modals */}
      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        existingCategories={categories}
        onSubmitCategory={handleSaveCategory}
      />

      {/* Quick Edit Limit Modal */}
      <QuickEditLimitModal
        isOpen={isQuickLimitOpen}
        onClose={() => {
          setIsQuickLimitOpen(false);
          setCategoryForQuickLimit(null);
        }}
        category={categoryForQuickLimit}
        onUpdateLimit={handleUpdateLimit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        category={categoryToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
