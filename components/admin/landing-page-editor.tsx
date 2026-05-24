"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
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
import type { LandingPageOutput } from "@/lib/landing-pages";

type LandingPageEditorProps = {
  landingPage: GeneratedLandingPage;
};

export function LandingPageEditor({ landingPage }: LandingPageEditorProps) {
  const [state, formAction, isPending] = useActionState(updateLandingPageAction, {
    success: false,
    message: "",
  });

  const output = landingPage.outputJson as LandingPageOutput;

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
        </div>

        {/* Middle/Right: Content Editor */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Hero Section</CardTitle>
              <CardDescription>The first thing visitors will see.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Eyebrow (Optional)</FieldLabel>
                  <Input
                    name="hero.eyebrow"
                    defaultValue={output.hero.eyebrow || ""}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel>Headline</FieldLabel>
                  <Input
                    name="hero.headline"
                    defaultValue={output.hero.headline}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel>Subheadline</FieldLabel>
                  <Textarea
                    name="hero.subheadline"
                    defaultValue={output.hero.subheadline}
                    className="bg-background min-h-20 resize-none"
                  />
                </Field>
                <Field>
                  <FieldLabel>CTA Label</FieldLabel>
                  <Input
                    name="hero.ctaLabel"
                    defaultValue={output.hero.ctaLabel}
                    className="bg-background"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Problem & Solution</CardTitle>
              <CardDescription>Frame the challenge and how this product solves it.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Problem</h4>
                <Field>
                  <FieldLabel>Problem Title</FieldLabel>
                  <Input
                    name="problem.title"
                    defaultValue={output.problem.title}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel>Problem Body</FieldLabel>
                  <Textarea
                    name="problem.body"
                    defaultValue={output.problem.body}
                    className="bg-background min-h-25 resize-none"
                  />
                </Field>
                <Field>
                  <FieldLabel>Pain Points (One per line)</FieldLabel>
                  <Textarea
                    name="problem.bullets"
                    defaultValue={output.problem.bullets.join("\n")}
                    className="bg-background min-h-25 resize-none"
                  />
                </Field>

                <div className="h-4" />
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Solution</h4>
                <Field>
                  <FieldLabel>Solution Title</FieldLabel>
                  <Input
                    name="solution.title"
                    defaultValue={output.solution.title}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel>Solution Body</FieldLabel>
                  <Textarea
                    name="solution.body"
                    defaultValue={output.solution.body}
                    className="bg-background min-h-25 resize-none"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Benefits & Use Cases</CardTitle>
              <CardDescription>Why it matters and where it applies.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                 <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Benefits</h4>
                 <p className="text-[10px] text-muted-foreground mb-2 italic">Format: Title | Description (One per line)</p>
                 <Textarea
                    name="benefits"
                    defaultValue={output.benefits.map(b => `${b.title} | ${b.description}`).join("\n")}
                    className="bg-background min-h-30 resize-none text-sm"
                 />

                 <div className="h-4" />
                 <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Use Cases</h4>
                 <p className="text-[10px] text-muted-foreground mb-2 italic">Format: Title | Description (One per line)</p>
                 <Textarea
                    name="useCases"
                    defaultValue={output.useCases.map(u => `${u.title} | ${u.description}`).join("\n")}
                    className="bg-background min-h-30 resize-none text-sm"
                 />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Audience Targeting</CardTitle>
              <CardDescription>Define who this product is for.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Who It&apos;s For (One per line)</FieldLabel>
                  <Textarea
                    name="whoItIsFor"
                    defaultValue={output.whoItIsFor.join("\n")}
                    className="bg-background min-h-25 resize-none"
                  />
                </Field>
                <Field>
                  <FieldLabel>Who It&apos;s NOT For (One per line)</FieldLabel>
                  <Textarea
                    name="whoItIsNotFor"
                    defaultValue={output.whoItIsNotFor.join("\n")}
                    className="bg-background min-h-25 resize-none"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">FAQ Section</CardTitle>
              <CardDescription>Answer common questions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <p className="text-[10px] text-muted-foreground mb-2 italic">Format: Question | Answer (One per line)</p>
                <Textarea
                  name="faq"
                  defaultValue={output.faq.map(f => `${f.question} | ${f.answer}`).join("\n")}
                  className="bg-background min-h-37.5 resize-none text-sm"
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Final Call to Action</CardTitle>
              <CardDescription>Give them one last reason to click.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Final Headline</FieldLabel>
                  <Input
                    name="finalCta.headline"
                    defaultValue={output.finalCta.headline}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel>Final Body</FieldLabel>
                  <Textarea
                    name="finalCta.body"
                    defaultValue={output.finalCta.body}
                    className="bg-background min-h-20 resize-none"
                  />
                </Field>
                <Field>
                  <FieldLabel>CTA Label</FieldLabel>
                  <Input
                    name="finalCta.ctaLabel"
                    defaultValue={output.finalCta.ctaLabel}
                    className="bg-background"
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
                    defaultValue={output.riskWarnings.join("\n")}
                    className="bg-background min-h-25 resize-none text-xs"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
