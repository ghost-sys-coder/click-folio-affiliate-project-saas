import { getSubscriptionByUserId, createTrialSubscription } from "@/db/subscriptions";
import { getPlanLimits, type PlanKey } from "./plans";
import { requireAuthenticatedUser } from "./auth-helpers";

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

/**
 * Resolves the current plan and limits for the authenticated user.
 * Creates a trial subscription if none exists.
 */
export async function getCurrentUserPlan(): Promise<UserPlan> {
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
    userId: user.id,
    plan: subscription.plan as PlanKey,
    status,
    trialStartedAt: subscription.trialStartedAt,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodStartedAt: subscription.currentPeriodStartedAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
    limits: getPlanLimits(subscription.plan as PlanKey),
  };
}
