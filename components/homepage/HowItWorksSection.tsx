import React from "react";

const steps = [
  {
    title: "Add your affiliate product",
    description:
      "Save the product link, description, category, image, destination URL, and any context that helps Clickfolio understand what you are promoting.",
  },
  {
    title: "Generate a landing page",
    description:
      "Turn one affiliate product into a focused landing page with hero copy, benefits, FAQs, disclosure text, SEO metadata, and tracked CTA buttons.",
  },
  {
    title: "Share campaign URLs",
    description:
      "Create trackable URLs for TikTok, Instagram, WhatsApp, email, or any channel so every campaign has clean attribution.",
  },
  {
    title: "Track clicks and improve",
    description:
      "See which products, pages, sources, and campaigns get attention, then refine your pages and content with better data.",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-background px-6 py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-secondary">
            Workflow
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight">
            From affiliate product to trackable campaign.
          </h2>

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Clickfolio helps you turn a product link into a dedicated landing
            page, share it with campaign tracking, and use click data to improve
            what you promote next.
          </p>
        </div>

        <div className="space-y-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold">{step.title}</h3>

              <p className="mt-2 leading-7 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;