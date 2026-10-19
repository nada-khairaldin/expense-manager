"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/AuthContext";
import { registerFormSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.budgetSetupCompleted) {
        router.replace("/budget-setup");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);

    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      setIsSuccess(true);

      // Brief delay to give visual confirmation then route to initial budget setup
      setTimeout(() => {
        router.push("/budget-setup");
      }, 700);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("تعذر إنشاء الحساب، يرجى التحقق من البيانات والمحاولة مجدداً");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-2 pb-4 text-center sm:text-start">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-black text-brand-primary dark:text-foreground">
              إنشاء حساب جديد
            </CardTitle>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-teal font-semibold bg-brand-teal-light dark:bg-brand-teal/20 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span>مجاني بالكامل</span>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm text-text-secondary">
            انضم إلى مصروفي وابدأ تنظيم ميزانيتك الشخصية والعائلية بخطوات بسيطة
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Success Notification Banner */}
          {isSuccess && (
            <div
              role="status"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs font-semibold animate-in fade-in"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                تم إنشاء حسابك بنجاح! جاري الانتقال إلى إعداد الميزانية الأولية...
              </div>
            </div>
          )}

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
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-name-input"
                className="block text-xs font-bold text-text-primary"
              >
                الاسم الكامل <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-name-input"
                  type="text"
                  autoComplete="name"
                  disabled={isSubmitting || isSuccess}
                  placeholder="مثال: أحمد عبد الله"
                  {...register("name")}
                  className={cn(
                    "w-full ps-10 pe-3.5 py-2.5 rounded-xl border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
                    errors.name ? "border-status-danger focus:ring-status-danger" : "border-border"
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-status-danger font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email-input"
                className="block text-xs font-bold text-text-primary"
              >
                البريد الإلكتروني <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email-input"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  disabled={isSubmitting || isSuccess}
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
              <label
                htmlFor="register-password-input"
                className="block text-xs font-bold text-text-primary"
              >
                كلمة المرور <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isSubmitting || isSuccess}
                  placeholder="6 أحرف على الأقل"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password-input"
                className="block text-xs font-bold text-text-primary"
              >
                تأكيد كلمة المرور <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isSubmitting || isSuccess}
                  placeholder="أعد إدخال كلمة المرور"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full ps-10 pe-10 py-2.5 rounded-xl border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all",
                    errors.confirmPassword
                      ? "border-status-danger focus:ring-status-danger"
                      : "border-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-status-danger font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={cn(
                "w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
                isSubmitting || isSuccess
                  ? "bg-brand-primary/80 cursor-not-allowed opacity-80"
                  : "bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99]"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء الحساب...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>تم الإنشاء بنجاح</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب والمتابعة</span>
                </>
              )}
            </button>
          </form>

          {/* Login Switch Link */}
          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-text-secondary">
              لديك حساب بالفعل على مصروفي؟{" "}
              <Link
                href="/login"
                className="font-bold text-brand-teal hover:underline inline-flex items-center gap-1 ms-1"
              >
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
