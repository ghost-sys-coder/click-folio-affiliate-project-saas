import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { buildAdminThemeBootstrapScript } from "@/lib/admin-theme-bootstrap";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeShell } from "@/components/admin/admin-theme";
import { AdminThemeSwitcher } from "@/components/admin/admin-theme-switcher";
import { PlanStatusBanner } from "@/components/admin/plan-status-banner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getOnboardingStateByClerkUserId } from "@/db/profiles";

export const dynamic = "force-dynamic";

const AdminDashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const onboardingState = await getOnboardingStateByClerkUserId(userId);

  if (!onboardingState.profileId) {
    redirect("/onboarding");
  }

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{ __html: buildAdminThemeBootstrapScript() }}
      />
      <AdminThemeShell>
        <TooltipProvider>
          <SidebarProvider>
            <AdminSidebar publicProfileHref={`/u/${onboardingState.username}`} />
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
                <SidebarTrigger />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none">Admin Dashboard</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Manage affiliate links, click tracking, content, and billing.
                  </p>
                </div>
                <AdminThemeSwitcher />
              </header>
              <div className="flex-1 p-4 md:p-6">
                <PlanStatusBanner />
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </AdminThemeShell>
    </>
  );
};

export default AdminDashboardLayout;
