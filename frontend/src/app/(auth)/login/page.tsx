"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/AuthContext";
import { loginFormSchema, type LoginFormValues } from "@/features/auth/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const getRedirectTarget = React.useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    const from = new URLSearchParams(window.location.search).get("from");
    return from && from.startsWith("/") ? from : "/dashboard";
  }, []);

  // If already authenticated, redirect to appropriate destination
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.budgetSetupCompleted) {
        router.replace("/budget-setup");
      } else {
        router.replace(getRedirectTarget());
      }
    }
  }, [isLoading, isAuthenticated, user, router, getRedirectTarget]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);

    try {
      const loggedUser = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      // Redirect based on budget setup status
      if (!loggedUser.budgetSetupCompleted) {
        router.push("/budget-setup");
      } else {
        router.push(getRedirectTarget());
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("تعذر تسجيل الدخول، يرجى المحاولة لاحقاً");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-2 pb-4 text-center sm:text-start">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-black text-brand-primary dark:text-foreground">
              تسجيل الدخول
            </CardTitle>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-teal font-semibold bg-brand-teal-light dark:bg-brand-teal/20 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>حساب آمن</span>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm text-text-secondary">
            أهلاً بك مجدداً في مصروفي! أدخل بيانات حسابك للمتابعة إلى لوحة التحكم
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs font-medium animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-input"
                className="block text-xs font-bold text-text-primary"
              >
                البريد الإلكتروني <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  disabled={isSubmitting}
                  placeholder="name@example.com"
                  {...register("email")}
                  className={cn(
                    "w-full ps-10 pe-3.5 py-2.5 rounded-xl border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all text-start",
                    errors.email ? "border-status-danger focus:ring-status-danger" : "border-border"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-status-danger font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-bold text-text-primary"
                >
                  كلمة المرور <span className="text-status-danger">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full ps-10 pe-10 py-2.5 rounded-xl border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
                    errors.password ? "border-status-danger focus:ring-status-danger" : "border-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-status-danger font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
                isSubmitting
                  ? "bg-brand-primary/80 cursor-not-allowed opacity-80"
                  : "bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99]"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Switch Link */}
          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-text-secondary">
              ليس لديك حساب على مصروفي بعد؟{" "}
              <Link
                href="/register"
                className="font-bold text-brand-teal hover:underline inline-flex items-center gap-1 ms-1"
              >
                <span>إنشاء حساب جديد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
