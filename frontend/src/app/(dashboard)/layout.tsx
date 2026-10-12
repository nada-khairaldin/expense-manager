import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = {
  title: "لوحة التحكم",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
