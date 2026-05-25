import { auth } from "@clerk/nextjs/server";

import { getSubscriptionByUserId } from "@/db/subscriptions";
import { getUserByClerkUserId } from "@/db/profiles";
import { plans as planLimits, type PlanKey } from "@/lib/plans";

import PricingCard from "./PricingCard";

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$9",
    description: "For launching your first serious affiliate page.",
    features: [
      "1 public profile",
      "25 affiliate links",
      "Basic click tracking",
      "25 AI generations per month",
      "5 published landings per month",
      "10 AI landing page generations per month",
      "25 AI landing page edits per month",
      "Campaign URL builder",
      "CSV, Excel, JSON import up to 100 rows per upload",
      "Clickfolio branding on public pages",
    ],
    cta: "Start 7 day trial",
    href: "/sign-up",
    highlighted: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$29",
    description: "For creators promoting consistently across channels.",
    features: [
      "1 public profile",
      "Unlimited affiliate links",
      "Advanced click analytics",
      "Campaign URL builder",
      "Top sources, campaigns, devices, countries",
      "150 content generations per month",
      "25 published landings per month",
      "50 AI landing page generations per month",
      "100 AI landing page edits per month",
      "CSV, Excel, JSON import up to 500 rows per upload",
      "Remove Clickfolio branding",
    ],
    cta: "Start 7 day trial",
    href: "/sign-up",
    highlighted: true,
  },
  {
    key: "creator_plus" as const,
    name: "Creator Plus",
    price: "$59",
    description: "For serious affiliate marketers with heavier workflows.",
    features: [
      "Everything in Pro",
      "500 content generations per month",
      "75 published landings per month",
      "125 AI landing page generations per month",
      "350 AI landing page edits per month",
      "CSV, Excel, JSON import up to 1,000 rows per upload",
      "Analytics Export",
      "Priority support",
      "Future creative brief tools",
      "Early access to new features",
    ],
    cta: "Start 7 day trial",
    href: "/sign-up",
    highlighted: false,
  },
];

type PricingCatalogPlan = (typeof plans)[number];

export type Plan = PricingCatalogPlan & {
  badge?: string;
  ctaDisabled?: boolean;
  isCurrentPlan?: boolean;
};

type PricingState = {
  ctaLabel: string;
  activePlanKey: PlanKey | null;
};

async function getPricingState(): Promise<PricingState> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { ctaLabel: "Start 7 day trial", activePlanKey: null };
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    return { ctaLabel: "Start 7 day trial", activePlanKey: null };
  }

  const subscription = await getSubscriptionByUserId(user.id);

  if (!subscription) {
    return { ctaLabel: "Start 7 day trial", activePlanKey: null };
  }

  if (subscription.status === "trialing") {
    return { ctaLabel: "Trialing", activePlanKey: null };
  }

  if (subscription.status === "active") {
    const currentPlan = planLimits[subscription.plan as PlanKey];
    return {
      ctaLabel: currentPlan?.label ?? "Current plan",
      activePlanKey: subscription.plan as PlanKey,
    };
  }

  return { ctaLabel: "Start 7 day trial", activePlanKey: null };
}

function getDisplayPlans({
  ctaLabel,
  activePlanKey,
}: PricingState) {
  return plans.map((plan) => {
    const isCurrentPlan = activePlanKey === plan.key;
    const isUpgradeTarget =
      (activePlanKey === "starter" && (plan.key === "pro" || plan.key === "creator_plus")) ||
      (activePlanKey === "pro" && plan.key === "creator_plus");

    if (activePlanKey === "creator_plus") {
      return {
        ...plan,
        cta: isCurrentPlan ? "Current plan" : "Included in lower tiers",
        highlighted: isCurrentPlan,
        badge: isCurrentPlan ? "Your highest plan" : undefined,
        ctaDisabled: !isCurrentPlan,
        isCurrentPlan,
      };
    }

    if (activePlanKey === "starter" || activePlanKey === "pro") {
      return {
        ...plan,
        cta: isCurrentPlan ? "Current plan" : isUpgradeTarget ? `Upgrade to ${plan.name}` : "Included below your plan",
        highlighted: isCurrentPlan,
        badge: isCurrentPlan ? "Current plan" : isUpgradeTarget ? "Recommended next step" : undefined,
        ctaDisabled: !isUpgradeTarget,
        isCurrentPlan,
      };
    }

    return {
      ...plan,
      cta: ctaLabel,
      highlighted: plan.highlighted,
      badge: plan.highlighted ? "Best start" : undefined,
      ctaDisabled: ctaLabel === "Trialing",
      isCurrentPlan: false,
    };
  });
}

const PricingSection = async () => {
  const pricingState = await getPricingState();
  const displayPlans = getDisplayPlans(pricingState);

  return (
    <section id="pricing" className="bg-surface px-6 py-24 text-foreground lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-accent">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              Start small. Upgrade when clicks matter.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Start with a 7 day trial, then choose the plan that matches your affiliate workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {displayPlans.map((plan) => (
              <PricingCard plan={plan} key={plan.name} />
            ))}
          </div>
        </div>
      </section>
  )
}

export default PricingSection
