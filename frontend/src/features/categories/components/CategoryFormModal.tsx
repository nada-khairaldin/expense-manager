"use client";

import * as React from "react";
import { useForm, Controller, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { CategoryItem } from "../types";
import {
  categoryFormSchema,
  CategoryFormValues,
} from "../schemas";
import {
  AVAILABLE_ICONS,
  AVAILABLE_COLORS,
  CategoryIcon,
} from "./CategoryIcon";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryItem | null;
  existingCategories: CategoryItem[];
  onSubmitCategory: (data: {
    name: string;
    icon: string;
    color: string;
    description?: string;
    limit: number | null;
  }) => Promise<void> | void;
}

interface CategoryFormContentProps {
  categoryToEdit?: CategoryItem | null;
  existingCategories: CategoryItem[];
  onClose: () => void;
  onSubmitCategory: (data: {
    name: string;
    icon: string;
    color: string;
    description?: string;
    limit: number | null;
  }) => Promise<void> | void;
}

function LiveCategoryPreview({ control }: { control: Control<CategoryFormValues> }) {
  const name = useWatch({ control, name: "name" }) || "";
  const icon = useWatch({ control, name: "icon" }) || "ShoppingCart";
  const color = useWatch({ control, name: "color" }) || "#16856B";
  const limit = useWatch({ control, name: "limit" });

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-muted/40">
      <CategoryIcon iconName={icon} color={color} size="lg" />
      <div className="min-w-0">
        <span className="text-xs font-bold text-text-primary block truncate">
          {name.trim() || "اسم التصنيف الجديد"}
        </span>
        <span className="text-[11px] text-text-muted block truncate">
          {typeof limit === "number" && limit > 0
            ? `الحد المالي المقترح: ${formatCurrency(limit)}`
            : "بدون حد إنفاق محدد"}
        </span>
      </div>
      <span className="ms-auto text-[11px] text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        معاينة
      </span>
    </div>
  );
}

function CategoryFormContent({
  categoryToEdit,
  existingCategories,
  onClose,
  onSubmitCategory,
}: CategoryFormContentProps) {
  const isEditing = Boolean(categoryToEdit);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [duplicateError, setDuplicateError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: categoryToEdit?.name ?? "",
      icon: categoryToEdit?.icon ?? "ShoppingCart",
      color: categoryToEdit?.color ?? "#16856B",
      description: categoryToEdit?.description ?? "",
      limit: categoryToEdit?.limit ?? null,
    },
  });

  const onFormSubmit = async (data: CategoryFormValues) => {
    setDuplicateError(null);
    const trimmedName = data.name.trim();

    // Check for duplicate name (excluding the category currently being edited)
    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        cat.id !== categoryToEdit?.id
    );

    if (isDuplicate) {
      setDuplicateError("يوجد تصنيف آخر بهذا الاسم بالفعل. يرجى اختيار اسم فريد.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitCategory({
        name: trimmedName,
        icon: data.icon,
        color: data.color,
        description: data.description?.trim() || undefined,
        limit: typeof data.limit === "number" ? data.limit : null,
      });
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-1">
      {/* Live Preview Header */}
      <LiveCategoryPreview control={control} />

      {/* 1. اسم التصنيف */}
      <div className="space-y-1">
        <label htmlFor="category-name-input" className="block text-xs font-bold text-text-primary">
          اسم التصنيف <span className="text-status-danger">*</span>
        </label>
        <input
          id="category-name-input"
          type="text"
          {...register("name")}
          placeholder="مثال: البقالة والتموين، الصيانة المنزلية..."
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl border bg-surface-muted/30 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
            errors.name || duplicateError ? "border-status-danger" : "border-border"
          )}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-[11px] text-status-danger mt-1">{errors.name.message}</p>
        )}
        {duplicateError && (
          <p className="text-[11px] text-status-danger mt-1">{duplicateError}</p>
        )}
      </div>

      {/* 2. اختيار اللون */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-primary">
          لون التصنيف المميز
        </label>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="ألوان التصنيف">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = field.value === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => field.onChange(col.hex)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal",
                      isSelected ? "scale-110 ring-2 ring-offset-2 ring-brand-teal" : "hover:scale-105 opacity-85 hover:opacity-100"
                    )}
                    style={{ backgroundColor: col.hex }}
                    aria-label={col.nameAr}
                    aria-checked={isSelected}
                    role="radio"
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* 3. اختيار الأيقونة */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-primary">
          الأيقونة المعبرة <span className="text-status-danger">*</span>
        </label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <div
              className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-xl border border-border bg-surface-muted/20 max-h-44 overflow-y-auto"
              role="radiogroup"
              aria-label="أيقونات التصنيف"
            >
              {Object.entries(AVAILABLE_ICONS).map(([key, item]) => {
                const Icon = item.icon;
                const isSelected = field.value === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => field.onChange(key)}
                    title={item.labelAr}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal",
                      isSelected
                        ? "bg-brand-primary text-white shadow-sm dark:bg-brand-teal"
                        : "hover:bg-surface-muted text-text-secondary hover:text-text-primary"
                    )}
                    aria-label={item.labelAr}
                    aria-checked={isSelected}
                    role="radio"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.icon && (
          <p className="text-[11px] text-status-danger mt-1">{errors.icon.message}</p>
        )}
      </div>

      {/* 4. حد الإنفاق (سقف الميزانية) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="category-limit-input" className="block text-xs font-bold text-text-primary">
            حد الإنفاق الشهري (اختياري)
          </label>
          <span className="text-[11px] text-text-muted">بالشيكل (₪)</span>
        </div>
        <Controller
          name="limit"
          control={control}
          render={({ field }) => (
            <input
              id="category-limit-input"
              type="number"
              step="any"
              min="0"
              value={field.value === null || field.value === undefined ? "" : field.value}
              onChange={(e) => {
                const val = e.target.value.trim();
                field.onChange(val === "" ? null : Number(val));
              }}
              placeholder="اتركيه فارغًا إذا كان التصنيف بدون سقف محدد"
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl border bg-surface-muted/30 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
                errors.limit ? "border-status-danger" : "border-border"
              )}
              disabled={isSubmitting}
            />
          )}
        />
        <p className="text-[11px] text-text-muted">
          إذا لم تحددي حدًا ماليًا، سيتم تصنيف القسم بأنه &quot;بدون حد إنفاق&quot; ولن تظهر له تنبيهات تجاوز.
        </p>
        {errors.limit && (
          <p className="text-[11px] text-status-danger mt-1">{errors.limit.message}</p>
        )}
      </div>

      {/* 5. الوصف */}
      <div className="space-y-1">
        <label htmlFor="category-desc-input" className="block text-xs font-bold text-text-primary">
          الوصف (اختياري)
        </label>
        <textarea
          id="category-desc-input"
          rows={2}
          {...register("description")}
          placeholder="ملاحظات توضيحية حول نفقات هذا التصنيف..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-muted/30 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all resize-none"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-[11px] text-status-danger mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-foreground hover:bg-surface-muted text-xs font-medium transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover dark:bg-brand-teal dark:hover:bg-brand-teal/90 shadow-sm transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <span>{isEditing ? "حفظ التعديلات" : "إضافة التصنيف"}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function CategoryFormModal({
  isOpen,
  onClose,
  categoryToEdit,
  existingCategories,
  onSubmitCategory,
}: CategoryFormModalProps) {
  if (!isOpen) return null;

  const isEditing = Boolean(categoryToEdit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل بيانات التصنيف" : "إضافة تصنيف جديد"}
      description={
        isEditing
          ? "تحديث اسم التصنيف، أيقونته، لونه، وسقف الإنفاق المالي المخصص له."
          : "أضيفي تصنيفًا جديدًا لتوزيع مصروفاتك ومراقبة ميزانيتك بفعالية."
      }
      className="max-w-xl max-h-[90vh] overflow-y-auto"
    >
      <CategoryFormContent
        key={categoryToEdit?.id ?? "new"}
        categoryToEdit={categoryToEdit}
        existingCategories={existingCategories}
        onClose={onClose}
        onSubmitCategory={onSubmitCategory}
      />
    </Modal>
  );
}
