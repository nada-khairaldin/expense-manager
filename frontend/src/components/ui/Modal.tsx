"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Bottom sheet on mobile, centered card on tablet/desktop) */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl transition-all",
          "z-10 max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain pb-safe sm:pb-6",
          "animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200",
          className
        )}
      >
        {/* Mobile Swipe Handle Indicator */}
        <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3 sm:hidden shrink-0" aria-hidden="true" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-1">
            <h2
              id="modal-title"
              className="text-base sm:text-lg font-bold text-brand-primary dark:text-foreground leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-text-muted hover:text-foreground hover:bg-surface-muted flex items-center justify-center active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal shrink-0"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
