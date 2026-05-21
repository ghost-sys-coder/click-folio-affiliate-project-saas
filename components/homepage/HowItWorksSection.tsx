import React from 'react';

const steps = [
    {
        title: "Add your affiliate links",
        description:
            "Save your offers, product descriptions, images, categories, and destination URLs in one dashboard.",
    },
    {
        title: "Publish your Clickfolio page",
        description:
            "Share one polished public page instead of sending people to scattered links across different platforms.",
    },
    {
        title: "Track what gets clicks",
        description:
            "Review your top links, traffic sources, and campaign performance so you know what to promote next.",
    },
];

const HowItWorksSection = () => {
    return (
        <section
            id="how-it-works"
            className="border-y border-white/10 bg-[#0b0b18] px-6 py-24 lg:px-8"
        >
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-emerald-300">
                        Workflow
                    </p>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight">
                        From messy links to measurable promotion.
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-white/65">
                        The product loop is simple. Add links, publish your page, promote
                        the page, then use the data to decide what deserves more effort.
                    </p>
                </div>

                <div className="space-y-5">
                    {steps.map((step, index) => (
                        <div
                            key={step.title}
                            className="rounded-3xl border border-white/10 bg-white/0.04 p-6"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold">
                                {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="mt-2 leading-7 text-white/60">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection