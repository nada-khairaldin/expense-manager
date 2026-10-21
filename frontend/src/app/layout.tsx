import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { PwaRegister } from "@/components/shared/PwaRegister";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16856B" },
    { media: "(prefers-color-scheme: dark)", color: "#0B131E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — إدارة المصروفات والميزانية الشخصية`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.nameEn }],
  keywords: ["مصروفي", "إدارة المصروفات", "الميزانية الشخصية", "تتبع المصاريف", "Masroofi", "Expense Manager", "PWA"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مصروفي",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Providers>
          <OfflineIndicator />
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
