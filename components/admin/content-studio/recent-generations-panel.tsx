import Link from "next/link";
import { Clock3 } from "lucide-react";

import type { RecentGenerationItem } from "@/components/admin/content-studio/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecentGenerationsPanel({
  generations,
}: {
  generations: RecentGenerationItem[];
}) {
  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
            <Clock3 className="size-4" />
          </span>
          <div className="min-w-0">
            <CardTitle>Recent generations</CardTitle>
            <CardDescription>
              Recently saved content packs for this workspace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {generations.length > 0 ? (
          <div className="grid gap-3">
            {generations.map((item) => (
              <Link
                key={item.id}
                href={`/admin/content/${item.id}`}
                className="block rounded-lg border bg-muted/20 p-3 transition hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.platform}</Badge>
                  <Badge variant="outline">{item.goal}</Badge>
                  <Badge variant="secondary">{item.tone}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium">{item.linkTitle}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {item.generatedText}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatGenerationTime(item.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-32 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No recent generations yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatGenerationTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
