import { ArrowRight, CheckCircle2, ShieldAlert, Check, X as CloseX, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildTrackedGoHref, type TrackingSearchParams } from "@/lib/click-tracking";
import type { LandingPageOutput, LandingPageSection } from "@/lib/landing-pages";

type LandingPageRendererProps = {
  data: LandingPageOutput;
  theme: string;
  affiliateLinkId: string;
  isPreview?: boolean;
  trackingParams?: TrackingSearchParams;
};

export function LandingPageRenderer({
  data,
  theme,
  affiliateLinkId,
  isPreview = false,
  trackingParams,
}: LandingPageRendererProps) {
  // Backward compatibility migration for old static schema
  const legacyData = data as any;
  const sections = data.sections || [
    { type: "hero", content: legacyData.hero },
    { type: "problem", content: legacyData.problem },
    { type: "solution", content: legacyData.solution },
    { type: "benefits", content: { title: "Why Choose This?", items: legacyData.benefits } },
    { type: "productHighlights", content: { title: "Key Features", items: legacyData.productHighlights } },
    { type: "audience", content: { 
        perfectForTitle: "Perfect For", 
        perfectForItems: legacyData.whoItIsFor,
        notForTitle: "Not For You If",
        notForItems: legacyData.whoItIsNotFor
    } },
    { type: "useCases", content: { title: "Real World Applications", items: legacyData.useCases } },
    { type: "faq", content: { title: "Common Questions", items: legacyData.faq } },
    { type: "finalCta", content: legacyData.finalCta },
  ].filter(s => s.content);

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {isPreview && (
        <div className="bg-amber-500 text-white text-center py-1 text-xs font-bold uppercase tracking-widest sticky top-0 z-50">
          Preview Mode - Page is not public
        </div>
      )}

      {sections.map((section, index) => (
        <SectionMapper 
          key={`${section.type}-${index}`} 
          section={section as any} 
          affiliateLinkId={affiliateLinkId}
          trackingParams={trackingParams}
        />
      ))}

      {/* Risk Warnings & Disclosure - Root level */}
      <footer className="py-16 bg-muted/50 border-t border-border">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          {data.riskWarnings && data.riskWarnings.length > 0 && (
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

function SectionMapper({ 
  section, 
  affiliateLinkId,
  trackingParams,
}: { 
  section: LandingPageSection; 
  affiliateLinkId: string;
  trackingParams?: TrackingSearchParams;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSection content={section.content} affiliateLinkId={affiliateLinkId} trackingParams={trackingParams} />;
    case "problem":
      return <ProblemSection content={section.content} />;
    case "solution":
      return <SolutionSection content={section.content} />;
    case "benefits":
      return <BenefitsSection content={section.content} />;
    case "useCases":
      return <UseCasesSection content={section.content} />;
    case "productHighlights":
      return <ProductHighlightsSection content={section.content} />;
    case "audience":
      return <AudienceSection content={section.content} />;
    case "comparison":
      return <ComparisonSection content={section.content} />;
    case "howItWorks":
      return <HowItWorksSection content={section.content} />;
    case "faq":
      return <FaqSection content={section.content} />;
    case "finalCta":
      return <FinalCtaSection content={section.content} affiliateLinkId={affiliateLinkId} trackingParams={trackingParams} />;
    default:
      return null;
  }
}

// --- Component Blocks ---

function HeroSection({
  content,
  affiliateLinkId,
  trackingParams,
}: {
  content: any;
  affiliateLinkId: string;
  trackingParams?: TrackingSearchParams;
}) {
  const ctaHref = buildTrackedGoHref(affiliateLinkId, trackingParams);
  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-border/40 bg-linear-to-b from-muted/50 to-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className={`flex flex-col ${content.imageUrl || content.videoUrl ? "lg:flex-row lg:items-center lg:text-left" : "text-center"} gap-12`}>
          <div className={`${content.imageUrl || content.videoUrl ? "lg:w-1/2" : "max-w-4xl mx-auto"}`}>
            {content.eyebrow && (
              <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-primary/10 text-primary">
                {content.eyebrow}
              </span>
            )}
            <h1 className="mb-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {content.headline}
            </h1>
            <p className="mb-10 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {content.subheadline}
            </p>
            <Button asChild size="lg" className="h-14 px-8 text-md font-bold shadow-xl shadow-primary/20">
              <a href={ctaHref}>
                {content.ctaLabel}
                <ArrowRight className="ml-2 size-5" />
              </a>
            </Button>
          </div>

          {(content.imageUrl || content.videoUrl) && (
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-muted/30 group">
                {content.videoUrl ? (
                  <video
                    src={content.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : content.imageUrl ? (
                  <img
                    src={content.imageUrl}
                    alt={content.headline}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProblemSection({ content }: { content: any }) {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{content.title}</h2>
          <div className="prose prose-lg dark:prose-invert mb-10 max-w-none text-muted-foreground">
            {content.body}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.bullets.map((bullet: string, i: number) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl border border-destructive/10 bg-destructive/5 text-sm">
                <ShieldAlert className="size-5 text-destructive shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionSection({ content }: { content: any }) {
  return (
    <section className="py-20 border-y border-border/40">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{content.title}</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {content.body}
          </p>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ content }: { content: any }) {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {content.items.map((benefit: any, i: number) => (
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
  );
}

function UseCasesSection({ content }: { content: any }) {
    return (
      <section className="py-20 bg-muted/10">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {content.items.map((useCase: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-background">
                <h3 className="font-bold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

function ProductHighlightsSection({ content }: { content: any }) {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
          <div className="grid gap-6">
            {content.items.map((highlight: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-2xl border border-primary/10 bg-background shadow-xs">
                <h3 className="font-bold text-lg md:w-1/3 shrink-0">{highlight.title}</h3>
                <p className="text-muted-foreground text-sm md:flex-1">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection({ content }: { content: any }) {
  return (
    <section className="py-20 border-b border-border/40">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30">
            <h3 className="text-xl font-bold mb-6 text-green-700 dark:text-green-400">{content.perfectForTitle}</h3>
            <ul className="space-y-3">
              {content.perfectForItems.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 items-center text-sm">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
            <h3 className="text-xl font-bold mb-6 text-red-700 dark:text-red-400">{content.notForTitle}</h3>
            <ul className="space-y-3">
              {content.notForItems.map((item: string, i: number) => (
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
  );
}

function ComparisonSection({ content }: { content: any }) {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
        <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-4 md:p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border">Feature</th>
                <th className="p-4 md:p-6 font-bold text-sm uppercase tracking-wider border-b border-border text-center">{content.leftColumn}</th>
                <th className="p-4 md:p-6 font-bold text-sm uppercase tracking-wider border-b border-border text-center bg-primary/5 text-primary">{content.rightColumn}</th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row: any, i: number) => (
                <tr key={i} className="group hover:bg-muted/5 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium border-b border-border/60">{row.feature}</td>
                  <td className="p-4 md:p-6 text-sm text-center border-b border-border/60 text-muted-foreground">{row.leftValue}</td>
                  <td className="p-4 md:p-6 text-sm text-center border-b border-border/60 font-semibold bg-primary/2">{row.rightValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ content }: { content: any }) {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container px-4 mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold mb-16 text-center">{content.title}</h2>
        <div className="relative space-y-12">
          {/* Vertical line connector */}
          <div className="absolute left-4.75 top-0 bottom-0 w-0.5 bg-primary/10 hidden md:block" />
          
          {content.steps.map((step: any, i: number) => (
            <div key={i} className="relative flex flex-col md:flex-row gap-8 items-start">
              <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 z-10 shadow-lg shadow-primary/20">
                {i + 1}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ content }: { content: any }) {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
        <div className="space-y-6">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card/50">
              <h4 className="font-bold text-lg mb-2 flex gap-3">
                <Info className="size-5 text-primary shrink-0 mt-0.5" />
                {item.question}
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-8">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({
  content,
  affiliateLinkId,
  trackingParams,
}: {
  content: any;
  affiliateLinkId: string;
  trackingParams?: TrackingSearchParams;
}) {
  const ctaHref = buildTrackedGoHref(affiliateLinkId, trackingParams);
  return (
    <section className="py-24 bg-primary text-primary-foreground text-center">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 max-w-3xl mx-auto">{content.headline}</h2>
        <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">{content.body}</p>
        <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-md font-bold shadow-2xl">
          <a href={ctaHref}>
            {content.ctaLabel}
            <ArrowRight className="ml-2 size-5" />
          </a>
        </Button>
      </div>
    </section>
  );
}
