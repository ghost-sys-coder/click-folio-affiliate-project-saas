import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { ComplianceChecklist } from "@/components/admin/content-studio/compliance-checklist";
import { GeneratedSectionCard } from "@/components/admin/content-studio/generated-section-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GeneratedPostDetail } from "@/db/generated-posts";
import {
  buildGeneratedContentSections,
  getContentStudioOutputSchema,
} from "@/lib/content-studio";

export function ContentGenerationDetail({
  generation,
}: {
  generation: GeneratedPostDetail;
}) {
  const output = getContentStudioOutputSchema(generation.platform).parse(
    generation.outputJson
  );
  const sections = buildGeneratedContentSections(output);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Content Studio
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Saved generation
          </h1>
          <p className="text-sm text-muted-foreground">
            Revisit a previously generated content pack and copy individual
            sections.
          </p>
        </div>
      </div>

      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle>{generation.linkTitle}</CardTitle>
          <CardDescription>
            Generated for {generation.platform} with goal &quot;{generation.goal}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{generation.platform}</Badge>
            <Badge variant="outline">{generation.goal}</Badge>
            <Badge variant="secondary">{generation.tone}</Badge>
            <Badge variant="outline">{generation.audience}</Badge>
          </div>
          {generation.extraContext ? (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {generation.extraContext}
            </div>
          ) : null}
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(generation.createdAt)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_18rem]">
        <div className="grid gap-3">
          {sections.map((section) => (
            <GeneratedSectionCard
              key={section.title}
              title={section.title}
              content={section.content}
            />
          ))}
        </div>
        <div className="grid gap-4">
          <ComplianceChecklist />
        </div>
      </div>
    </div>
  );
}
