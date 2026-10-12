
/**
 * Centralized Arabic date formatter.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (Number.isNaN(dateObj.getTime())) {
    return "تاريخ غير صالح";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("ar-PS", {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Formats a date as YYYY-MM-DD for date inputs.
 */
export function formatDateToISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
