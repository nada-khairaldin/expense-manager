"use client";

import * as React from "react";
import { ExpenseFormModal } from "@/features/expenses/components/ExpenseFormModal";
import { useExpenses } from "@/features/expenses/useExpenses";

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const { createExpense } = useExpenses();

  return (
    <ExpenseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitCreate={createExpense}
      onSuccess={onSuccess}
    />
  );
}
