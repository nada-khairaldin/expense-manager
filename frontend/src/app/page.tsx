import Link from "next/link";
import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ArrowLeft, CheckCircle2, ShieldCheck, Wallet, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-brand-primary-foreground shadow-sm">
              <Wallet className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-primary dark:text-foreground">
                {siteConfig.name}
              </span>
              <span className="text-xs text-text-muted ms-2 hidden sm:inline-block font-sans">
                {siteConfig.nameEn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-teal text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <span>دخول لوحة التحكم</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        لوحة التحكم
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
        <p>جميع الحقوق محفوظة © 2026 — {siteConfig.name} ({siteConfig.nameEn})</p>
      </footer>
    </div>
  );
}
