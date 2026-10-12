import Link from "next/link";
import { Receipt, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ExpensesPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary dark:text-foreground">
            سجل المصروفات
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            إدارة وتصفية سجل المصروفات اليومية والشهرية
          </p>
        </div>

        <Badge variant="warning" size="md">
          <Clock className="w-3.5 h-3.5 me-1" />
          المرحلة 4 (قيد التطوير)
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-teal" />
            <span>نظام إدارة العمليات والمصروفات</span>
          </CardTitle>
          <CardDescription>
            سيتم تفعيل هذه الصفحة بالكامل في المرحلة الرابعة (Phase 4) عبر ربط نقاط نهاية الخلفية البرمجية الحقيقية.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-2 text-xs text-text-secondary">
            <h4 className="font-bold text-brand-primary dark:text-foreground">
              الميزات المخططة لصفحة المصروفات:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>إضافة وتعديل وحذف المصروفات مع التحقق الصارم من صحة المدخلات عبر Zod.</li>
              <li>تصفية متقدمة حسب التصنيف، النطاق الزمني، والمبلغ الأدنى/الأقصى (الموجود بالخلفية).</li>
              <li>الترقيم والتقسيم إلى صفحات (Pagination).</li>
              <li>حسابات المجموع الفوري بالعملة المعتمدة (الشيكل ILS ₪).</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              <span>العودة إلى لوحة التحكم</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
