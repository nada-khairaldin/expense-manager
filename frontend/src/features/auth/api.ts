import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  BudgetSetupInput,
  UpdateDefaultBudgetInput,
  User,
  UserSettings,
  BudgetCycle,
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
 * Update authenticated user's display name / profile
 * PATCH /auth/profile
 */
export async function updateProfileApi(
  input: { name: string },
  token: string
): Promise<User> {
  return apiClient<User>("/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Update budget renewal day, currency & default budget, marking setup as completed
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
 * Update only default budget amount
 * PATCH /settings/default-budget
 */
export async function updateDefaultBudgetApi(
  input: UpdateDefaultBudgetInput,
  token: string
): Promise<UserSettings> {
  return apiClient<UserSettings>("/settings/default-budget", {
    method: "PATCH",
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

/**
 * Get current active budget cycle for user
 * GET /budget-cycles/current
 */
export async function getCurrentBudgetCycleApi(token: string): Promise<BudgetCycle | null> {
  return apiClient<BudgetCycle | null>("/budget-cycles/current", {
    method: "GET",
    token,
  });
}

/**
 * Update current active cycle's budget amount independently
 * PATCH /budget-cycles/current
 */
export async function updateCurrentCycleBudgetApi(
  budgetAmount: number,
  token: string
): Promise<BudgetCycle> {
  return apiClient<BudgetCycle>("/budget-cycles/current", {
    method: "PATCH",
    token,
    body: JSON.stringify({ budgetAmount }),
  });
}

/**
 * Update a specific cycle's budget amount by ID
 * PATCH /budget-cycles/:id
 */
export async function updateCycleBudgetByIdApi(
  cycleId: string,
  budgetAmount: number,
  token: string
): Promise<BudgetCycle> {
  return apiClient<BudgetCycle>(`/budget-cycles/${cycleId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ budgetAmount }),
  });
}
