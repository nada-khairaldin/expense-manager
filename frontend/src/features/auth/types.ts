/**
 * Authentication, User, and Budget Cycle Types for Masroofi
 */

export type SupportedCurrency = "ILS" | "USD" | "JOD" | "EUR";

export interface UserSettings {
  id: string;
  userId?: string;
  currency: SupportedCurrency | string;
  budgetRenewalDay: number;
  defaultBudgetAmount: number | null;
  budgetSetupCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  currency: SupportedCurrency | string;
  budgetRenewalDay: number;
  defaultBudgetAmount: number | null;
  budgetSetupCompleted: boolean;
  settings?: UserSettings | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface BudgetSetupInput {
  currency: SupportedCurrency;
  budgetRenewalDay: number;
  defaultBudgetAmount?: number;
}

export interface UpdateDefaultBudgetInput {
  defaultBudgetAmount: number;
}

export interface BudgetCycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  percentageUsed: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
