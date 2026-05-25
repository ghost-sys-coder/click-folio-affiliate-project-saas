import React from 'react';
import { FileText, Link2, MousePointerClick, PenLine, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI landing page generator",
    description:
      "Turn individual affiliate products into focused landing pages with hero copy, benefits, FAQs, disclosure text, SEO metadata, and tracked CTA buttons.",
  },
  {
    icon: Link2,
    title: "Affiliate link hub",
    description:
      "Create one clean public profile for your affiliate offers, product recommendations, tools, and resources.",
  },
  {
    icon: MousePointerClick,
    title: "Campaign and click tracking",
    description:
      "Build campaign URLs, track clicks by source, medium, and campaign, then see which links and channels are getting attention.",
  },
  {
    icon: PenLine,
    title: "Content Studio",
    description:
      "Generate platform ready promotional content for TikTok, Instagram, Facebook, X, LinkedIn, YouTube Shorts, WhatsApp, and email.",
  },
];
const FeaturesSection = () => {
    return (
        <section id="features" className="bg-surface px-6 py-24 text-foreground lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-accent">
                        Features
                    </p>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight">
                        Everything needed for the first serious version.
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Clickfolio avoids bloated tools. It focuses on the core affiliate
                        workflow: organize links, share one page, track clicks, and
                        promote consistently.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-accent">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
