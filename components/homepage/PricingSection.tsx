import React from 'react';
import PricingCard from './PricingCard';

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For testing your first affiliate page.",
    features: [
      "1 public profile",
      "5 affiliate links",
      "Basic click tracking",
      "10 AI generations per month",
    ],
    cta: "Start free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$15",
    description: "For creators promoting consistently.",
    features: [
      "Unlimited affiliate links",
      "Advanced link analytics",
      "UTM builder",
      "100 AI generations per month",
      "Custom public page themes",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Creator Plus",
    price: "$29",
    description: "For serious affiliate marketers.",
    features: [
      "Everything in Pro",
      "More AI generations",
      "CSV export",
      "Weekly performance report",
      "Priority support",
    ],
    cta: "Start Creator Plus",
    href: "/sign-up",
    highlighted: false,
  },
];

export type Plan = (typeof plans)[number];

const PricingSection = () => {
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
              Keep the free plan useful, but make serious promotion a paid
              workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard plan={plan} key={plan.name} />
            ))}
          </div>
        </div>
      </section>
  )
}

export default PricingSection
