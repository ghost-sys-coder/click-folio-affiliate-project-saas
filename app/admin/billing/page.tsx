import { BillingDashboard } from "@/components/admin/billing-dashboard";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { getUsageSummary } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const userPlan = await getCurrentUserPlan();
  const usage = await getUsageSummary(userPlan.userId);

  return (
    <div className="mx-auto max-w-6xl">
      <BillingDashboard userPlan={userPlan} usage={usage} />
    </div>
  );
}