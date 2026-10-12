import { Info } from "lucide-react";

export interface DemoDataNoticeProps {
  className?: string;
}

export function DemoDataNotice({ className }: DemoDataNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-brand-teal/20 bg-brand-teal/5 text-xs text-text-secondary ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-brand-teal shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-brand-teal">بيانات تجريبية (Demo Data):</strong> الأرقام المعروضة في لوحة التحكم نموذج محاكاة واقعي ومترابط لدورة الميزانية لأغراض المعاينة والتصميم (المرحلة 2).
        </span>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md hidden sm:inline-block">
        وضع المعاينة
      </span>
    </div>
  );
}
