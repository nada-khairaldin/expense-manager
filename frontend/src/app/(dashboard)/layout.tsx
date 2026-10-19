import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "لوحة التحكم",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} requireSetupComplete={true}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
