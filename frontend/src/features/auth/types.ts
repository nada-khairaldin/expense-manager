/**
 * Authentication and User Types for Masroofi
 */

export type SupportedCurrency = "ILS" | "USD" | "JOD" | "EUR";

export interface UserSettings {
  id: string;
  userId?: string;
  currency: SupportedCurrency | string;
  budgetRenewalDay: number;
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
