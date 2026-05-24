import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { LandingPageOutput } from "@/lib/landing-pages";

type LandingPageRendererProps = {
  data: LandingPageOutput;
  theme: string;
  affiliateLinkId: string;
  isPreview?: boolean;
};

export function LandingPageRenderer({
  data,
  theme,
  affiliateLinkId,
  isPreview = false,
}: LandingPageRendererProps) {
  const ctaHref = `/go/${affiliateLinkId}`;

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {isPreview && (
        <div className="bg-amber-500 text-white text-center py-1 text-xs font-bold uppercase tracking-widest sticky top-0 z-50">
          Preview Mode - Page is not public
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-border/40 bg-linear-to-b from-muted/50 to-background">
        <div className="container px-4 mx-auto relative z-10 text-center">
          {data.hero.eyebrow && (
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-primary/10 text-primary">
              {data.hero.eyebrow}
            </span>
          )}
          <h1 className="mb-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            {data.hero.headline}
          </h1>
          <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {data.hero.subheadline}
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-md font-bold shadow-xl shadow-primary/20">
            <Link href={ctaHref}>
              {data.hero.ctaLabel}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{data.problem.title}</h2>
            <div className="prose prose-lg dark:prose-invert mb-10 max-w-none text-muted-foreground">
              {data.problem.body}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.problem.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl border border-destructive/10 bg-destructive/5 text-sm">
                  <ShieldAlert className="size-5 text-destructive shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 border-y border-border/40">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.solution.title}</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {data.solution.body}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits & Highlights */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose This?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {data.benefits.map((benefit, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
            <div className="grid gap-6">
              {data.productHighlights.map((highlight, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-2xl border border-primary/10 bg-background shadow-xs">
                  <h3 className="font-bold text-lg md:w-1/3 shrink-0">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm md:flex-1">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20 border-b border-border/40">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30">
              <h3 className="text-xl font-bold mb-6 text-green-700 dark:text-green-400">Perfect For</h3>
              <ul className="space-y-3">
                {data.whoItIsFor.map((item, i) => (
                  <li key={i} className="flex gap-3 items-center text-sm">
                    <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
              <h3 className="text-xl font-bold mb-6 text-red-700 dark:text-red-400">Not For You If</h3>
              <ul className="space-y-3">
                {data.whoItIsNotFor.map((item, i) => (
                  <li key={i} className="flex gap-3 items-center text-sm">
                    <span className="size-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 font-bold text-[10px] shrink-0">X</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted/10">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Real World Applications</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {data.useCases.map((useCase, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-background">
                <h3 className="font-bold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Common Questions</h2>
          <div className="space-y-6">
            {data.faq.map((item, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-bold text-lg">{item.question}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 max-w-3xl mx-auto">{data.finalCta.headline}</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">{data.finalCta.body}</p>
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-md font-bold shadow-2xl">
            <Link href={ctaHref}>
              {data.finalCta.ctaLabel}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Risk Warnings & Disclosure */}
      <footer className="py-16 bg-muted/50 border-t border-border">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          {data.riskWarnings.length > 0 && (
            <div className="mb-12 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Important Considerations</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {data.riskWarnings.map((warning, i) => (
                  <span key={i} className="text-[10px] px-3 py-1 rounded-full border border-border bg-background text-muted-foreground">
                    {warning}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto italic">
            {data.disclosure}
          </p>
        </div>
      </footer>
    </div>
  );
}
