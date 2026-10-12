"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileNav } from "./MobileNav";
import { AddExpenseModal } from "@/components/dashboard/AddExpenseModal";

interface DashboardShellProps {
  children: React.ReactNode;
}

// Create a context so any child page or component can trigger the AddExpense modal
export const AddExpenseContext = React.createContext<{
  openAddExpense: () => void;
}>({
  openAddExpense: () => {},
});

export function useAddExpense() {
  return React.useContext(AddExpenseContext);
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);

  const openAddExpense = React.useCallback(() => {
    setIsAddExpenseOpen(true);
  }, []);

  const closeAddExpense = React.useCallback(() => {
    setIsAddExpenseOpen(false);
  }, []);

  return (
    <AddExpenseContext.Provider value={{ openAddExpense }}>
      <div className="min-h-screen flex bg-background text-foreground transition-colors">
        {/* Desktop Sidebar (RTL: right side) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader onOpenAddExpense={openAddExpense} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>

        {/* Global Add Expense Modal */}
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={closeAddExpense}
        />
      </div>
    </AddExpenseContext.Provider>
  );
}
