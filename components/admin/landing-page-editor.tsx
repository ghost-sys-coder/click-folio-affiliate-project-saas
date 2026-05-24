"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Save, X, Video, Image as ImageIcon, Type, Layout, List, HelpCircle, CheckCircle, AlertCircle, Repeat } from "lucide-react";
import { toast } from "sonner";

import { updateLandingPageAction, type LandingPageUpdateState } from "@/actions/landing-pages";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedLandingPage } from "@/db/schema";
import type { LandingPageOutput, LandingPageSection } from "@/lib/landing-pages";
import { LandingPageMediaUploader } from "./landing-page-media-uploader";

type LandingPageEditorProps = {
  landingPage: GeneratedLandingPage;
};

export function LandingPageEditor({ landingPage }: LandingPageEditorProps) {
  const [state, formAction, isPending] = useActionState(updateLandingPageAction, {
    success: false,
    message: "",
  });

  const output = landingPage.outputJson as LandingPageOutput;
  const legacyData = output as any;

  const sections = output.sections || [
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

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Landing page updated.");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-8 pb-10">
      <input type="hidden" name="id" value={landingPage.id} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Landing Page</h1>
          <p className="text-muted-foreground">
            Refine the generated copy and SEO settings for your page.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="px-8 shadow-lg shadow-primary/20">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Metadata & Settings */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Page Settings</CardTitle>
              <CardDescription>Internal identifier and slug.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Admin Title</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={landingPage.title}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="slug">Public Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={landingPage.slug}
                    className="bg-background font-mono text-xs"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">SEO Metadata</CardTitle>
              <CardDescription>Optimize for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="seoTitle">SEO Title</FieldLabel>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    defaultValue={landingPage.seoTitle || ""}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seoDescription">SEO Description</FieldLabel>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    defaultValue={landingPage.seoDescription || ""}
                    className="bg-background min-h-25 resize-none text-sm"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Legal & Transparency</CardTitle>
              <CardDescription>Affiliate disclosures and risk warnings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Affiliate Disclosure</FieldLabel>
                  <Textarea
                    name="disclosure"
                    defaultValue={output.disclosure}
                    className="bg-background min-h-20 resize-none text-xs"
                  />
                </Field>
                <Field>
                  <FieldLabel>Risk Warnings (One per line)</FieldLabel>
                  <Textarea
                    name="riskWarnings"
                    defaultValue={output.riskWarnings?.join("\n") || ""}
                    className="bg-background min-h-25 resize-none text-xs"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right: Dynamic Content Editor */}
        <div className="space-y-8 lg:col-span-2">
          {sections.map((section, index) => (
            <SectionEditorItem 
              key={`${section.type}-${index}`} 
              section={section as any} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </form>
  );
}

function SectionEditorItem({ section, index }: { section: LandingPageSection; index: number }) {
  const prefix = `section.${index}.`;
  
  const getIcon = () => {
    switch (section.type) {
      case "hero": return <Layout className="size-5 text-primary" />;
      case "problem": return <AlertCircle className="size-5 text-destructive" />;
      case "solution": return <CheckCircle className="size-5 text-green-500" />;
      case "benefits": return <Sparkles className="size-5 text-primary" />;
      case "useCases": return <Repeat className="size-5 text-primary" />;
      case "productHighlights": return <List className="size-5 text-primary" />;
      case "audience": return <Type className="size-5 text-primary" />;
      case "comparison": return <Layout className="size-5 text-primary" />;
      case "howItWorks": return <List className="size-5 text-primary" />;
      case "faq": return <HelpCircle className="size-5 text-primary" />;
      case "finalCta": return <Sparkles className="size-5 text-primary" />;
      default: return <Type className="size-5 text-primary" />;
    }
  };

  const getTitle = () => {
    const type = section.type;
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {Object.entries(section.content).map(([key, value]) => {
            if (key === "imageUrl" || key === "videoUrl") return null; // Handled separately if needed
            
            if (Array.isArray(value)) {
              // Handle simple string arrays (bullets, items as strings)
              if (value.length === 0 || typeof value[0] === "string") {
                return (
                  <Field key={key}>
                    <FieldLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</FieldLabel>
                    <Textarea
                      name={`${prefix}${key}`}
                      defaultValue={value.join("\n")}
                      className="bg-background min-h-20 resize-none"
                    />
                  </Field>
                );
              }
              // Complex arrays (items with title/description)
              return (
                <div key={key} className="space-y-2">
                   <FieldLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')} (Read-only for now)</FieldLabel>
                   <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground italic border border-dashed border-border">
                     Complex list items are currently non-editable in this view.
                   </div>
                </div>
              );
            }

            if (typeof value === "string") {
              const isLong = value.length > 100;
              return (
                <Field key={key}>
                  <FieldLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</FieldLabel>
                  {isLong ? (
                    <Textarea
                      name={`${prefix}${key}`}
                      defaultValue={value}
                      className="bg-background min-h-20 resize-none"
                    />
                  ) : (
                    <Input
                      name={`${prefix}${key}`}
                      defaultValue={value}
                      className="bg-background"
                    />
                  )}
                </Field>
              );
            }

            return null;
          })}

          {section.type === "hero" && (
            <div className="grid gap-6 pt-4 sm:grid-cols-2">
               {/* Simplified media display for hero */}
               <div className="text-xs text-muted-foreground italic">
                 Media assets are preserved but currently managed via the generator or JSON.
               </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
