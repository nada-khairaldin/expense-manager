import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-brand-teal selection:text-white">
      {/* Auth Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Logo variant="horizontal" size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <React.Suspense
            fallback={
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {children}
          </React.Suspense>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        <p>
          جميع الحقوق محفوظة © 2026 — {siteConfig.name} ({siteConfig.nameEn})
        </p>
      </footer>
    </div>
  );
}
