import { getSubscriptionByUserId, createTrialSubscription } from "@/db/subscriptions";
import { getPlanLimits, type PlanKey } from "./plans";
import { requireAuthenticatedUser } from "./auth-helpers";
import { isMissingTableError } from "./database-errors";

export type UserPlan = {
  userId: string;
  plan: PlanKey;
  status: "trialing" | "active" | "expired" | "canceled";
  trialStartedAt: Date;
  trialEndsAt: Date;
  currentPeriodStartedAt: Date | null;
  currentPeriodEnd: Date | null;
  limits: ReturnType<typeof getPlanLimits>;
};

export type UserPlanResult = 
  | { ok: true; plan: UserPlan }
  | { ok: false; error: "database-setup-required" | "unknown" };

/**
 * Resolves the current plan and limits for the authenticated user.
 * Creates a trial subscription if none exists.
 */
export async function getCurrentUserPlan(): Promise<UserPlanResult> {
  try {
    const user = await requireAuthenticatedUser();
    let subscription = await getSubscriptionByUserId(user.id);

    if (!subscription) {
      subscription = await createTrialSubscription(user.id);
    }

    const now = new Date();
    let status = subscription.status as UserPlan["status"];

    // Check for expired trial
    if (status === "trialing" && subscription.trialEndsAt < now) {
      status = "expired";
    }

    // Check for expired paid plan (simple check for now)
    if (status === "active" && subscription.currentPeriodEnd && subscription.currentPeriodEnd < now) {
      status = "expired";
    }

    return {
      ok: true,
      plan: {
        userId: user.id,
        plan: subscription.plan as PlanKey,
        status,
        trialStartedAt: subscription.trialStartedAt,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStartedAt: subscription.currentPeriodStartedAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        limits: getPlanLimits(subscription.plan as PlanKey),
      }
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "database-setup-required" };
    }
    return { ok: false, error: "unknown" };
  }
}
