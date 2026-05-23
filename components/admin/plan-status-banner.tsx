import { AlertTriangle, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export async function PlanStatusBanner() {
  const userPlan = await getCurrentUserPlan();

  if (userPlan.status === "expired") {
    return (
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-destructive">Your trial has expired</p>
            <p className="text-muted-foreground text-xs">Upgrade to continue generating content and creating links.</p>
          </div>
        </div>
        <Link 
          href="/admin/billing" 
          className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground transition hover:bg-destructive/90"
        >
          View Plans
        </Link>
      </div>
    );
  }

  if (userPlan.status === "trialing") {
    const now = new Date();
    const diff = userPlan.trialEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    return (
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Trial ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</p>
            <p className="text-muted-foreground text-xs">You are currently on the {userPlan.limits.label} trial plan.</p>
          </div>
        </div>
        <Link 
          href="/admin/billing" 
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover shadow-sm"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  // Active paid plan
  if (userPlan.status === "active") {
      return (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground border border-border">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{userPlan.limits.label} Plan</p>
                <p className="text-muted-foreground text-xs">Your subscription is active and healthy.</p>
              </div>
            </div>
            <Link 
              href="/admin/billing" 
              className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Manage Billing
            </Link>
          </div>
      );
  }

  return null;
}
