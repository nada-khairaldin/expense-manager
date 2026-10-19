"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Logo } from "@/components/shared/Logo";
import { Loader2 } from "lucide-react";

export interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSetupComplete?: boolean;
  guestOnly?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireSetupComplete = true,
  guestOnly = false,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const effectiveRequireAuth = guestOnly ? false : requireAuth;
  const effectiveRequireSetup = guestOnly ? false : requireSetupComplete;

  React.useEffect(() => {
    if (isLoading) return;

    if (guestOnly) {
      if (isAuthenticated && user) {
        if (!user.budgetSetupCompleted) {
          router.replace("/budget-setup");
        } else {
          const from =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("from")
              : null;
          const target = from && from.startsWith("/") ? from : "/dashboard";
          router.replace(target);
        }
      }
      return;
    }

    if (effectiveRequireAuth) {
      if (!isAuthenticated || !user) {
        const redirectUrl = `/login?from=${encodeURIComponent(pathname)}`;
        router.replace(redirectUrl);
        return;
      }

      if (effectiveRequireSetup && !user.budgetSetupCompleted) {
        if (pathname !== "/budget-setup") {
          router.replace("/budget-setup");
        }
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    guestOnly,
    effectiveRequireAuth,
    effectiveRequireSetup,
    pathname,
    router,
  ]);

  const isAuthorized =
    !effectiveRequireAuth ||
    (Boolean(isAuthenticated && user) &&
      (!effectiveRequireSetup || Boolean(user?.budgetSetupCompleted) || pathname === "/budget-setup"));

  const isGuestBlocked = Boolean(guestOnly && isAuthenticated && user);

  const shouldBlockContent = isLoading || !isAuthorized || isGuestBlocked;

  return (
    <>
      {shouldBlockContent && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <Logo variant="horizontal" size="lg" />
            <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
              <span>جاري التحقق من بيانات الجلسة...</span>
            </div>
          </div>
        </div>
      )}
      <div
        className={shouldBlockContent ? "invisible h-0 overflow-hidden pointer-events-none select-none" : undefined}
        aria-hidden={shouldBlockContent ? true : undefined}
      >
        {children}
      </div>
    </>
  );
}
