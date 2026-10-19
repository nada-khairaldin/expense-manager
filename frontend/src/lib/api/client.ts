/**
 * Centralized API Client for Masroofi (مصروفي)
 * Handles HTTP requests, authorization headers, and error standardization.
 */

export class ApiClientError extends Error {
  statusCode: number;
  errors?: unknown[];

  constructor(message: string, statusCode: number, errors?: unknown[]) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
};

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, headers = {}, ...customConfig } = options;
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${normalizedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: requestHeaders,
      ...customConfig,
    });
  } catch {
    throw new ApiClientError(
      "تعذر الاتصال بخادم مصروفي. يرجى التحقق من اتصالك بالإنترنت وتشغيل الخادم.",
      0
    );
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return {} as T;
  }

  let data: { message?: string; errors?: unknown[] } | null = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = (await response.json()) as { message?: string; errors?: unknown[] };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = "حدث خطأ أثناء معالجة الطلب";

    if (data?.message) {
      errorMessage = data.message;
    } else if (response.status === 401) {
      errorMessage = "بيانات الاعتماد غير صالحة أو انتهت الجلسة";
    } else if (response.status === 403) {
      errorMessage = "ليس لديك الصلاحية للوصول إلى هذا المورد";
    } else if (response.status === 404) {
      errorMessage = "العنصر المطلوب غير موجود";
    } else if (response.status === 409) {
      errorMessage = "هذا السجل موجود بالفعل ومسجل مسبقاً";
    } else if (response.status >= 500) {
      errorMessage = "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً";
    }

    // Map common backend messages to clear Arabic
    if (errorMessage === "Invalid email or password") {
      errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    } else if (errorMessage === "Email is already registered") {
      errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول أو استخدام بريد آخر";
    } else if (errorMessage === "Authentication required" || errorMessage === "Invalid or expired token") {
      errorMessage = "جلسة العمل غير صالحة أو منتهية، يرجى تسجيل الدخول مجدداً";
    } else if (errorMessage === "Validation failed") {
      errorMessage = "البيانات المدخلة غير صالحة، يرجى التحقق من الحقول";
    }

    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data as T;
}
