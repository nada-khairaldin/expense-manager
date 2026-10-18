import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "اسم التصنيف مطلوب ولا يمكن تركه فارغًا" })
    .max(50, { message: "اسم التصنيف يجب ألا يتجاوز 50 حرفًا" }),
  icon: z
    .string()
    .trim()
    .min(1, { message: "يرجى اختيار أيقونة للتصنيف" }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "يرجى اختيار لون صالح بصيغة الست عشري" }),
  description: z
    .string()
    .trim()
    .max(200, { message: "الوصف يجب ألا يتجاوز 200 حرف" })
    .optional(),
  limit: z
    .number({ message: "يجب إدخال رقم صحيح أو عشري" })
    .positive({ message: "يجب أن يكون حد الإنفاق أكبر من صفر (أو اتركيه فارغًا بدون حد)" })
    .nullable()
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
