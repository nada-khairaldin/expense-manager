"use client";

import * as React from "react";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "./storage";
import {
  loginApi,
  registerApi,
  getMeApi,
  updateBudgetSetupApi,
} from "./api";
import type {
  User,
  LoginInput,
  RegisterInput,
  BudgetSetupInput,
  UserSettings,
} from "./types";
import { ApiClientError } from "@/lib/api/client";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  completeBudgetSetup: (input: BudgetSetupInput) => Promise<UserSettings>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore session on initial mount
  React.useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await getMeApi(storedToken);
        if (isMounted) {
          setToken(storedToken);
          setUser(userData);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof ApiClientError && error.statusCode === 401) {
            removeStoredToken();
            setToken(null);
            setUser(null);
          } else {
            // Keep token stored in case it was a temporary network error
            setToken(storedToken);
          }
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = React.useCallback(async (input: LoginInput): Promise<User> => {
    const res = await loginApi(input);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = React.useCallback(async (input: RegisterInput): Promise<User> => {
    const res = await registerApi(input);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const completeBudgetSetup = React.useCallback(
    async (input: BudgetSetupInput): Promise<UserSettings> => {
      const currentToken = token || getStoredToken();
      if (!currentToken) {
        throw new Error("يجب تسجيل الدخول لإتمام إعداد الميزانية");
      }

      const updatedSettings = await updateBudgetSetupApi(input, currentToken);

      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currency: updatedSettings.currency,
          budgetRenewalDay: updatedSettings.budgetRenewalDay,
          budgetSetupCompleted: true,
          settings: updatedSettings,
        };
      });

      return updatedSettings;
    },
    [token]
  );

  const logout = React.useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = React.useCallback(async (): Promise<User | null> => {
    const currentToken = token || getStoredToken();
    if (!currentToken) return null;

    try {
      const userData = await getMeApi(currentToken);
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, [token]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      completeBudgetSetup,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, completeBudgetSetup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
