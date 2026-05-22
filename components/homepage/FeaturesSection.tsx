import React from 'react';
import { Link2, MousePointerClick, PenLine, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: Link2,
        title: "Affiliate link hub",
        description:
            "Create one clean public page for your best affiliate offers, products, tools, and recommendations.",
    },
    {
        icon: MousePointerClick,
        title: "Click tracking",
        description:
            "See which links get attention, where traffic comes from, and which offers deserve more promotion.",
    },
    {
        icon: PenLine,
        title: "Content generator",
        description:
            "Generate platform ready posts for Facebook, TikTok, Instagram, X, LinkedIn, YouTube Shorts, and WhatsApp.",
    },
    {
        icon: ShieldCheck,
        title: "Disclosure helper",
        description:
            "Add clear affiliate disclosures to your public page and promotional content without rewriting every post.",
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
