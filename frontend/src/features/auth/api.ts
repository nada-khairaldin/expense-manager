import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  BudgetSetupInput,
  User,
  UserSettings,
} from "./types";

/**
 * Register a new user
 * POST /auth/register
 */
export async function registerApi(input: RegisterInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Authenticate existing user
 * POST /auth/login
 */
export async function loginApi(input: LoginInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Fetch authenticated user profile and settings
 * GET /auth/me
 */
export async function getMeApi(token: string): Promise<User> {
  return apiClient<User>("/auth/me", {
    method: "GET",
    token,
  });
}

/**
 * Update budget renewal day & currency, marking setup as completed
 * PUT /settings/budget-setup
 */
export async function updateBudgetSetupApi(
  input: BudgetSetupInput,
  token: string
): Promise<UserSettings> {
  return apiClient<UserSettings>("/settings/budget-setup", {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Get current user budget settings
 * GET /settings/budget-setup
 */
export async function getSettingsApi(token: string): Promise<UserSettings> {
  return apiClient<UserSettings>("/settings/budget-setup", {
    method: "GET",
    token,
  });
}
