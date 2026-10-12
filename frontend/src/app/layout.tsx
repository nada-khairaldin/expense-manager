import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — إدارة المصروفات والميزانية الشخصية`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.nameEn }],
  keywords: ["مصروفي", "إدارة المصروفات", "الميزانية الشخصية", "تتبع المصاريف", "Masroofi", "Expense Manager"],
  icons: {
    icon: "/favicon.ico",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
