"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Sparkles, X, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";

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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  landingPageAudiences,
  landingPageGoals,
  landingPageTones,
  type LandingPageGenerationInput,
} from "@/lib/landing-pages";
import type { AffiliateLink } from "@/db/schema";
import { appThemes } from "@/lib/themes";
import { LandingPageMediaUploader } from "./landing-page-media-uploader";

type LandingPageGeneratorFormProps = {
  affiliateLinks: AffiliateLink[];
};

export function LandingPageGeneratorForm({
  affiliateLinks,
}: LandingPageGeneratorFormProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<LandingPageGenerationInput>({
    linkId: "",
    audience: "Use profile audience",
    customAudience: "",
    pageGoal: "Drive affiliate clicks",
    tone: "Direct",
    theme: "growth-mint",
    extraContext: "",
    avoidClaims: "",
    imageUrl: "",
    videoUrl: "",
  });

  const selectedLink = affiliateLinks.find((l) => l.id === formData.linkId);
  const hasWeakDescription = selectedLink && (!selectedLink.description || selectedLink.description.length < 50);

  const handleGenerate = async () => {
    if (!formData.linkId) {
      toast.error("Please select an affiliate link.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Generation failed.");
      }

      toast.success("Landing page generated successfully!");
      router.push(`/admin/landing-pages/${result.id}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Landing Page Generator</h1>
        <p className="text-muted-foreground">
          Create conversion-focused landing pages for your affiliate products using AI.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Generation Settings</CardTitle>
              <CardDescription>Configure how your page should be built.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Affiliate Product</FieldLabel>
                  <Select
                    value={formData.linkId}
                    onValueChange={(v) => setFormData({ ...formData, linkId: v })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select an affiliate link" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {affiliateLinks.map((link) => (
                          <SelectItem key={link.id} value={link.id}>
                            {link.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>The product this landing page will promote.</FieldDescription>
                </Field>

                {hasWeakDescription && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2 items-start text-xs text-amber-800">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Weak description:</strong> This link has a very short description. Consider adding more details in the &quot;Extra Context&quot; section for better results.
                    </p>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Target Audience</FieldLabel>
                    <Select
                      value={formData.audience}
                      onValueChange={(v) => setFormData({ ...formData, audience: v as typeof formData.audience })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {landingPageAudiences.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Page Goal</FieldLabel>
                    <Select
                      value={formData.pageGoal}
                      onValueChange={(v) => setFormData({ ...formData, pageGoal: v as typeof formData.pageGoal })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {landingPageGoals.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {formData.audience === "Custom" && (
                  <Field>
                    <FieldLabel>Custom Audience Details</FieldLabel>
                    <Input
                      value={formData.customAudience}
                      onChange={(e) => setFormData({ ...formData, customAudience: e.target.value })}
                      placeholder="e.g. Freelance designers looking for remote work"
                      className="bg-background"
                    />
                  </Field>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Content Tone</FieldLabel>
                    <Select
                      value={formData.tone}
                      onValueChange={(v) => setFormData({ ...formData, tone: v as typeof formData.tone })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {landingPageTones.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Page Theme</FieldLabel>
                    <Select
                      value={formData.theme}
                      onValueChange={(v) => setFormData({ ...formData, theme: v as typeof formData.theme })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={appThemes.growthMint}>Growth Mint (Light)</SelectItem>
                          <SelectItem value={appThemes.signalPurple}>Signal Purple (Dark)</SelectItem>
                          <SelectItem value={appThemes.commerceGold}>Commerce Gold (Premium)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Extra Product Context</FieldLabel>
                  <Textarea
                    value={formData.extraContext}
                    onChange={(e) => setFormData({ ...formData, extraContext: e.target.value })}
                    placeholder="Add specific details, key features, or unique selling points..."
                    className="min-h-30 bg-background resize-none"
                  />
                  <FieldDescription>Help the AI write better copy by providing more context.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Claims to Avoid</FieldLabel>
                  <Textarea
                    value={formData.avoidClaims}
                    onChange={(e) => setFormData({ ...formData, avoidClaims: e.target.value })}
                    placeholder="List any specific claims or words you want to avoid..."
                    className="min-h-20 bg-background resize-none"
                  />
                  <FieldDescription>Ensure compliance by restricting certain types of claims.</FieldDescription>
                </Field>

                <div className="pt-4 border-t border-border/40">
                   <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                     Hero Media <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">(Optional)</span>
                   </h4>
                   <div className="grid gap-6 sm:grid-cols-2">
                     <Field>
                       <FieldLabel>Hero Image</FieldLabel>
                       <div className="flex flex-col gap-3">
                         {formData.imageUrl ? (
                           <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img
                               src={formData.imageUrl}
                               alt="Hero preview"
                               className="h-full w-full object-cover"
                             />
                             <Button
                               type="button"
                               className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white opacity-0 shadow-sm transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                               onClick={() => setFormData({ ...formData, imageUrl: "" })}
                             >
                               <X className="size-4" />
                             </Button>
                           </div>
                         ) : null}
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                             <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                             <Input
                               placeholder="Image URL"
                               value={formData.imageUrl}
                               onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                               className="h-9 bg-background text-xs"
                             />
                           </div>
                           <LandingPageMediaUploader
                             type="image"
                             onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                           />
                         </div>
                       </div>
                     </Field>

                     <Field>
                       <FieldLabel>Hero Video</FieldLabel>
                       <div className="flex flex-col gap-3">
                         {formData.videoUrl ? (
                           <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                             <video
                               src={formData.videoUrl}
                               className="h-full w-full object-cover"
                               controls
                             />
                             <Button
                               type="button"
                               className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white opacity-0 shadow-sm transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                               onClick={() => setFormData({ ...formData, videoUrl: "" })}
                             >
                               <X className="size-4" />
                             </Button>
                           </div>
                         ) : null}
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                             <Video className="size-4 text-muted-foreground shrink-0" />
                             <Input
                               placeholder="Video URL"
                               value={formData.videoUrl}
                               onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                               className="h-9 bg-background text-xs"
                             />
                           </div>
                           <LandingPageMediaUploader
                             type="video"
                             onUpload={(url) => setFormData({ ...formData, videoUrl: url })}
                           />
                         </div>
                       </div>
                     </Field>
                   </div>
                   <p className="mt-4 text-[10px] text-muted-foreground leading-relaxed italic">
                     These media assets will be used in the top hero section of your landing page. If you leave them blank, you can still add them later in the editor.
                   </p>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm bg-primary/2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Sparkles className="size-5" />
                Ready to Generate?
              </CardTitle>
              <CardDescription>
                Generation usually takes 15-30 seconds. A draft will be created for you to edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full shadow-lg shadow-primary/20"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.linkId}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-5" />
                    Generate Landing Page
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3 text-xs text-muted-foreground leading-relaxed">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">AI Quality Rules</h4>
            <ul className="space-y-2 list-disc pl-4">
              <li>No invented product features or discounts.</li>
              <li>No fake testimonials or urgency.</li>
              <li>No medical, financial, or legal claims.</li>
              <li>Automatic affiliate disclosure included.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
