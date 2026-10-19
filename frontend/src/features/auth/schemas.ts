import { z } from "zod";

export const SUPPORTED_CURRENCIES = ["ILS", "USD", "JOD", "EUR"] as const;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "يرجى إدخال البريد الإلكتروني" })
    .email({ message: "صيغة البريد الإلكتروني غير صالحة" }),
  password: z
    .string()
    .min(1, { message: "يرجى إدخال كلمة المرور" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "الاسم يجب أن يتكون من حرفين على الأقل" })
      .max(50, { message: "الاسم يجب ألا يتجاوز 50 حرفًا" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "يرجى إدخال البريد الإلكتروني" })
      .email({ message: "صيغة البريد الإلكتروني غير صالحة" }),
    password: z
      .string()
      .min(6, { message: "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل" })
      .max(100, { message: "كلمة المرور يجب ألا تتجاوز 100 حرف" }),
    confirmPassword: z
      .string()
      .min(1, { message: "يرجى تأكيد كلمة المرور" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const budgetSetupFormSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES, {
    message: "يرجى اختيار عملة صالحة (ILS, USD, JOD, EUR)",
  }),
  budgetRenewalDay: z
    .number({
      message: "يوم التجديد يجب أن يكون رقمًا صالحًا",
    })
    .int("يوم التجديد يجب أن يكون رقمًا صحيحًا")
    .min(1, "يوم التجديد يجب أن يكون بين 1 و 31")
    .max(31, "يوم التجديد يجب أن يكون بين 1 و 31"),
});

export type BudgetSetupFormValues = z.infer<typeof budgetSetupFormSchema>;
