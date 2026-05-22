"use client";

import { useState } from "react";

import { ContentGenerationForm } from "@/components/admin/content-studio/content-generation-form";
import { ContentStudioEmptyState } from "@/components/admin/content-studio/content-studio-empty-state";
import { GeneratedContentPanel } from "@/components/admin/content-studio/generated-content-panel";
import { RecentGenerationsPanel } from "@/components/admin/content-studio/recent-generations-panel";
import type {
  ContentStudioLinkOption,
  GeneratedContentResult,
  RecentGenerationItem,
} from "@/components/admin/content-studio/types";
import type { ContentStudioRequest } from "@/lib/content-studio";

export function ContentStudioShell({
  links,
  recentGenerations,
}: {
  links: ContentStudioLinkOption[];
  recentGenerations: RecentGenerationItem[];
}) {
  const [result, setResult] = useState<GeneratedContentResult | null>(null);
  const [generations, setGenerations] = useState(recentGenerations);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateContent(request: ContentStudioRequest) {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Content generation failed.");
        return;
      }

      const nextResult: GeneratedContentResult = {
        id: data.id,
        provider: data.provider,
        output: data.output,
        generatedText: data.generatedText,
        createdAt: data.createdAt,
      };

      setResult(nextResult);
      setGenerations((current) => [
        {
          id: nextResult.id,
          linkTitle:
            links.find((link) => link.id === request.linkId)?.title ??
            "Affiliate link",
          platform: request.platform,
          goal: request.goal,
          audience: request.audience,
          tone: request.tone,
          generatedText: nextResult.generatedText,
          createdAt: nextResult.createdAt,
        },
        ...current,
      ]);
    } catch {
      setError("Content generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Content Studio
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate structured, platform-specific affiliate content from your
          real profile and link data.
        </p>
      </div>

      {links.length === 0 ? (
        <ContentStudioEmptyState />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[24rem_1fr] xl:items-start">
          <div className="grid gap-5">
            <ContentGenerationForm
              links={links}
              isGenerating={isGenerating}
              onGenerate={generateContent}
            />
            <RecentGenerationsPanel generations={generations} />
          </div>
          <GeneratedContentPanel
            result={result}
            isLoading={isGenerating}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
