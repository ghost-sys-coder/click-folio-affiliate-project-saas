"use client";

import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

import { ComplianceChecklist } from "@/components/admin/content-studio/compliance-checklist";
import { GeneratedSectionCard } from "@/components/admin/content-studio/generated-section-card";
import type {
  GeneratedContentResult,
  GeneratedContentSection,
} from "@/components/admin/content-studio/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContentStudioOutput } from "@/lib/content-studio";

export function GeneratedContentPanel({
  result,
  isLoading,
  error,
}: {
  result: GeneratedContentResult | null;
  isLoading: boolean;
  error: string | null;
}) {
  const sections = result ? buildGeneratedContentSections(result.output) : [];

  return (
    <div className="grid gap-4">
      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle>Generated content pack</CardTitle>
          <CardDescription>
            Copy each section into the platform where you plan to publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid min-h-64 place-items-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
              <div className="grid gap-3">
                <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating a grounded content pack...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-40 items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className="grid gap-3">
              <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Generated with {result.provider ?? "configured AI provider"}.
              </div>
              {sections.map((section) => (
                <GeneratedSectionCard
                  key={section.title}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
              <div className="grid max-w-sm gap-3">
                <Sparkles className="mx-auto size-6 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Select a link and generation settings to create your first
                  content pack.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ComplianceChecklist />
    </div>
  );
}

function buildGeneratedContentSections(
  output: ContentStudioOutput
): GeneratedContentSection[] {
  if ("sceneOutline" in output) {
    return [
      { title: "Hooks", content: output.hooks.join("\n") },
      {
        title: "Scene outline",
        content: output.sceneOutline
          .map(
            (scene) =>
              `${scene.scene}\nVisual: ${scene.visual}\nVoiceover: ${scene.voiceover}\nOn-screen text: ${scene.onScreenText}`
          )
          .join("\n\n"),
      },
      { title: "Caption", content: output.caption },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      {
        title: "Hashtags or keywords",
        content: output.hashtagsOrKeywords.join(" "),
      },
      { title: "Platform notes", content: output.platformNotes.join("\n") },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  if ("statusPost" in output) {
    return [
      { title: "Status post", content: output.statusPost },
      { title: "DM message", content: output.dmMessage },
      { title: "Follow-up message", content: output.followUpMessage },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  if ("emailBody" in output) {
    return [
      { title: "Subject lines", content: output.subjectLines.join("\n") },
      { title: "Preview text", content: output.previewText },
      { title: "Email body", content: output.emailBody },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  return [
    { title: "Hooks", content: output.hooks.join("\n") },
    { title: "Main post", content: output.mainPost },
    { title: "Short caption", content: output.shortCaption },
    { title: "CTA options", content: output.ctaOptions.join("\n") },
    { title: "Disclosure", content: output.disclosureVersion },
    {
      title: "Hashtags or keywords",
      content: output.hashtagsOrKeywords.join(" "),
    },
    { title: "Platform notes", content: output.platformNotes.join("\n") },
    { title: "Risk warnings", content: output.riskWarnings.join("\n") },
  ];
}
