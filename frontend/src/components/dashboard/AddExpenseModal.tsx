"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { Sparkles, CheckCircle2, Database, WifiOff } from "lucide-react";

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة مصروف جديد"
      description="ميزة إضافة المصروفات اليومية والحفظ الفوري"
    >
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-gold-light dark:bg-brand-gold/10 border border-brand-gold/30 text-xs text-brand-gold font-medium">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>هذه الميزة قيد التطوير وستكتمل في المراحل القادمة (Phase 4).</span>
        </div>

        {/* Planned Features Preview */}
        <div className="p-4 rounded-xl border border-border bg-surface-muted/50 space-y-2.5 text-xs text-text-secondary">
          <div className="font-semibold text-brand-primary dark:text-foreground">
            ما سيتم تفعيله عند ربط واجهة البرمجة (API):
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
            <span>إدخال المبلغ بالشيكل الإسرائيلي ({formatCurrency(0)}) والتحقق من القيمة المدخلة.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
            <span>ربط فوري بالتصنيف المناسب ومراقبة سقف الميزانية التلقائي.</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-teal shrink-0" />
            <span>ربط مباشر بنقاط النهاية الحقيقية بالخلفية (`POST /expenses`).</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-brand-teal shrink-0" />
            <span>جاهزية الدعم المستقبلي للمزامنة غير المتصلة بالإنترنت (Offline Sync).</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-2">
          <Badge variant="neutral" size="sm" className="justify-center sm:justify-start">
            حالة المعمارية: المرحلة 2
          </Badge>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover active:scale-95 transition-all touch-manipulation inline-flex items-center justify-center"
          >
            حسنًا، فهمت
          </button>
        </div>
      </div>
    </Modal>
  );
}
