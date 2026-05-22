import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopySectionButton } from "@/components/admin/content-studio/copy-section-button";

export function GeneratedSectionCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <Card className="border-border/70 bg-card" size="sm">
      <CardHeader className="gap-2 sm:grid-cols-[1fr_auto]">
        <CardTitle>{title}</CardTitle>
        <CopySectionButton value={content} />
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap rounded-lg border bg-muted/20 px-3 py-2 text-sm leading-6 text-muted-foreground">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
