import { ExternalLink } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TopLink } from "@/db/analytics";

export function TopLinksTable({ links }: { links: TopLink[] }) {
  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
            <ExternalLink className="size-4" />
          </span>
          <div className="min-w-0">
            <CardTitle>Top affiliate links</CardTitle>
            <CardDescription>
              Links ranked by tracked click volume.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {links.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[3rem_1fr_6rem] gap-3 bg-muted/40 px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
              <span>Rank</span>
              <span>Link</span>
              <span className="text-right">Clicks</span>
            </div>
            <div className="divide-y">
              {links.map((link, index) => (
                <div
                  key={link.id}
                  className="grid grid-cols-[3rem_1fr_6rem] gap-3 px-3 py-3 text-sm"
                >
                  <span className="text-muted-foreground">#{index + 1}</span>
                  <span className="min-w-0 truncate font-medium">
                    {link.title}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {link.clicks.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No affiliate link clicks yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
