"use client";

import * as React from "react";
import { CategoryItem, SpendingLimitFilter, CategorySortOption } from "@/features/categories/types";
import { useCategoriesStore } from "@/features/categories/useCategoriesStore";
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
import { DemoDataNotice } from "@/components/dashboard/DemoDataNotice";
import { CheckCircle2, Info } from "lucide-react";

export default function CategoriesPage() {
  const { categories, saveCategories, resetCategories } = useCategoriesStore();

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
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
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
  const handleSaveCategory = (data: {
    name: string;
    icon: string;
    color: string;
    description?: string;
    limit: number | null;
  }) => {
    if (categoryToEdit) {
      // Edit existing
      const updated = categories.map((cat) => {
        if (cat.id === categoryToEdit.id) {
          return {
            ...cat,
            name: data.name,
            icon: data.icon,
            color: data.color,
            description: data.description,
            limit: data.limit,
          };
        }
        return cat;
      });
      saveCategories(updated);
      showToast(`تم تحديث بيانات تصنيف "${data.name}" بنجاح.`);
    } else {
      // Add new
      const nextId = Math.max(0, ...categories.map((c) => c.id)) + 1;
      const newCategory: CategoryItem = {
        id: nextId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        description: data.description,
        limit: data.limit,
        spent: 0, // newly created category has 0 spending in this cycle
        transactionCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      saveCategories([newCategory, ...categories]);
      showToast(`تمت إضافة تصنيف "${data.name}" بنجاح.`);
    }
  };

  // Handler: Quick Update Limit
  const handleUpdateLimit = (categoryId: number, newLimit: number | null) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          limit: newLimit,
        };
      }
      return cat;
    });
    saveCategories(updated);
    const catName = categories.find((c) => c.id === categoryId)?.name ?? "";
    showToast(
      newLimit !== null
        ? `تم تحديث سقف ميزانية "${catName}" بنجاح.`
        : `تم إلغاء سقف ميزانية "${catName}".`
    );
  };

  // Handler: Delete Category
  const handleConfirmDelete = (categoryId: number) => {
    const target = categories.find((c) => c.id === categoryId);
    const updated = categories.filter((cat) => cat.id !== categoryId);
    saveCategories(updated);
    showToast(`تم حذف تصنيف "${target?.name ?? ""}".`);
  };

  // Handler: Reset Demo Data
  const handleResetDemoData = () => {
    resetCategories();
    setSearchQuery("");
    setActiveFilter("all");
    setActiveSort("name");
    showToast("تمت استعادة بيانات التصنيفات الافتراضية بنجاح.");
  };

  return (
    <div className="space-y-6">
      {/* 1. Subtle Demo Data Notice */}
      <DemoDataNotice />

      {/* Floating Action Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 p-3 rounded-xl border border-brand-teal/30 bg-brand-teal/10 text-brand-teal text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Page Header */}
      <CategoriesHeader
        onOpenAddCategory={() => {
          setCategoryToEdit(null);
          setIsFormModalOpen(true);
        }}
        onResetDemoData={handleResetDemoData}
        totalCategories={categories.length}
      />

      {/* 3. Summary Overview Cards */}
      <CategoriesSummary summary={summary} />

      {/* 4. Search & Filtering Toolbar */}
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

      {/* 5. Main Category List / States */}
      <div>
        {categories.length === 0 ? (
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

      {/* 6. Contextual Help / Design Notice */}
      <div className="p-4 rounded-2xl border border-border bg-surface-muted/30 text-xs text-text-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-teal shrink-0" />
          <span>
            حدود الإنفاق تتيح لكِ التنبيه الاستباقي عند استهلاك 85% أو أكثر من الميزانية الشهرية المحددة للتصنيف.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-text-muted shrink-0">
          المرحلة 3: إدارة التصنيفات
        </span>
      </div>

      {/* 7. Dialogs & Modals */}
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
