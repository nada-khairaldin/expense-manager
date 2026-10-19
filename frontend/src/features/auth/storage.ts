/**
 * Token Storage Manager for Masroofi
 * Stores JWT token in localStorage and mirrors in cookie for SSR and security best practices.
 */

const TOKEN_KEY = "masroofi_auth_token";
const COOKIE_NAME = "masroofi_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;

    // Fallback: check cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === COOKIE_NAME && value) {
        return decodeURIComponent(value);
      }
    }
  } catch {
    // Storage access may be restricted in private browsing
  }

  return null;
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TOKEN_KEY, token);

    // Also set standard cookie with 7 days expiration (SameSite=Lax)
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      token
    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Graceful fallback
  }
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Graceful fallback
  }
}
