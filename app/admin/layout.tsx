import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { appThemes } from "@/lib/themes";

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-theme={appThemes.growthMint} className="min-h-svh bg-background text-foreground">
      <TooltipProvider>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
              <SidebarTrigger />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">Admin Dashboard</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Manage affiliate links, click tracking, content, and billing.
                </p>
              </div>
            </header>
            <div className="flex-1 p-4 md:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export default AdminDashboardLayout;
