import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_CONFIG } from "@/lib/config";
import { getCurrentSession } from "@/lib/auth-guard";

async function AuthenticatedDashboard({ children }) {
  const current = await getCurrentSession();

  if (!current) {
    redirect("/login");
  }

  if (AUTH_CONFIG.requireEmailVerification && !current.user.emailVerifiedAt) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={current.user}
      settings={current.settings}
      isPasswordConfirmed={current.isPasswordConfirmed}
    >
      {children}
    </DashboardShell>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
