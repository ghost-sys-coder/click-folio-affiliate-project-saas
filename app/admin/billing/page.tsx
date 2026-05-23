import { BillingDashboard } from "@/components/admin/billing-dashboard";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { getUsageSummary } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-xl bg-muted/20">
            <h2 className="text-lg font-semibold">Database setup required</h2>
            <p className="text-muted-foreground text-sm mt-1">Run migrations to enable billing features.</p>
        </div>
    );
  }

  const userPlan = planResult.plan;
  const usage = await getUsageSummary(userPlan.userId);

  return (
    <div className="mx-auto max-w-6xl">
      <BillingDashboard userPlan={userPlan} usage={usage} />
    </div>
  );
}