import React from 'react';
import PricingCard from './PricingCard';

const plans = [
  {
    name: "Starter",
    price: "$9",
    description: "For launching your first serious affiliate page.",
    features: [
      "1 public profile",
      "25 affiliate links",
      "Basic click tracking",
      "25 AI generations per month",
      "Campaign URL builder",
      "CSV, Excel, JSON import up to 100 rows per upload",
      "Clickfolio branding on public pages",
    ],
    cta: "Start Starter",
    href: "/sign-up",
    highlighted: false,
  },
  {
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
      "CSV, Excel, JSON import up to 500 rows per upload",
      "Remove Clickfolio branding",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Creator Plus",
    price: "$59",
    description: "For serious affiliate marketers with heavier workflows.",
    features: [
      "Everything in Pro",
      "500 Content generations per month",
      "CSV, Excel, JSON import up to 1,000 rows per upload",
      "Analytics Export",
      "Priority support",
      "Future Creative brief tools",
      "Early access to new features",
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
