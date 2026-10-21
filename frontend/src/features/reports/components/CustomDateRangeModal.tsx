"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Calendar, AlertCircle, ArrowLeftRight } from "lucide-react";
import { formatDateToISO } from "@/lib/formatters/formatDate";

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate?: string;
  currentEndDate?: string;
  onApply: (startDate: string, endDate: string) => void;
}

export function CustomDateRangeModal({
  isOpen,
  onClose,
  currentStartDate,
  currentEndDate,
  onApply,
}: CustomDateRangeModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize dates safely in useEffect to avoid SSR / prerender mismatch
  useEffect(() => {
    if (isOpen) {
      if (currentStartDate && currentEndDate) {
        setStartDate(currentStartDate.slice(0, 10));
        setEndDate(currentEndDate.slice(0, 10));
      } else {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        setStartDate(formatDateToISO(thirtyDaysAgo));
        setEndDate(formatDateToISO(today));
      }
      setError(null);
    }
  }, [isOpen, currentStartDate, currentEndDate]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("يرجى تحديد تاريخي البداية والنهاية");
      return;
    }

    if (startDate > endDate) {
      setError("تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية");
      return;
    }

    onApply(startDate, endDate);
    onClose();
  };

  const handlePreset = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    setStartDate(formatDateToISO(pastDate));
    setEndDate(formatDateToISO(today));
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تحديد نطاق زمني مخصص"
      description="اختر تاريخ البداية والنهاية لحساب التقرير المالي للفترة المحددة"
    >
      <form onSubmit={handleApply} className="space-y-4">
        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            فترات سريعة:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs text-text-primary transition-colors min-h-[36px]"
            >
              آخر 7 أيام
            </button>
            <button
              type="button"
              onClick={() => handlePreset(14)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs text-text-primary transition-colors min-h-[36px]"
            >
              آخر 14 يوم
            </button>
            <button
              type="button"
              onClick={() => handlePreset(30)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs text-text-primary transition-colors min-h-[36px]"
            >
              آخر 30 يوم
            </button>
            <button
              type="button"
              onClick={() => handlePreset(90)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs text-text-primary transition-colors min-h-[36px]"
            >
              آخر 3 أشهر (90 يوم)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="custom-start-date"
              className="block text-xs font-semibold text-text-secondary"
            >
              من تاريخ:
            </label>
            <div className="relative">
              <input
                id="custom-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="custom-end-date"
              className="block text-xs font-semibold text-text-secondary"
            >
              إلى تاريخ:
            </label>
            <div className="relative">
              <input
                id="custom-end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text-secondary transition-colors min-h-[44px]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-primary dark:bg-brand-teal text-white dark:text-brand-dark font-medium text-xs hover:opacity-90 transition-opacity min-h-[44px]"
          >
            تطبيق النطاق
          </button>
        </div>
      </form>
    </Modal>
  );
}
