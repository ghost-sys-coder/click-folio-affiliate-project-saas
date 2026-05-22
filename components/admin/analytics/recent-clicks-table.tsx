import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentClick } from "@/db/analytics";

export function RecentClicksTable({ clicks }: { clicks: RecentClick[] }) {
  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
            <Clock3 className="size-4" />
          </span>
          <div className="min-w-0">
            <CardTitle>Recent clicks</CardTitle>
            <CardDescription>
              Latest tracked affiliate link activity.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {clicks.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid gap-3 bg-muted/40 px-3 py-2 text-xs font-medium uppercase text-muted-foreground md:grid-cols-[minmax(10rem,1fr)_11rem_15rem_12rem]">
              <span>Link</span>
              <span>Time</span>
              <span>Campaign</span>
              <span>Context</span>
            </div>
            <div className="divide-y">
              {clicks.map((click) => (
                <div
                  key={click.id}
                  className="grid gap-3 px-3 py-3 text-sm md:grid-cols-[minmax(10rem,1fr)_11rem_15rem_12rem] md:items-center"
                >
                  <span className="min-w-0 truncate font-medium">
                    {click.linkTitle}
                  </span>
                  <span className="text-muted-foreground">
                    {formatClickTime(click.clickedAt)}
                  </span>
                  <span className="flex min-w-0 flex-wrap gap-1.5">
                    <Badge variant="secondary">{click.source}</Badge>
                    <Badge variant="outline">{click.medium}</Badge>
                    <Badge variant="outline">{click.campaign}</Badge>
                  </span>
                  <span className="text-muted-foreground">
                    {click.device} - {click.country}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No recent clicks yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatClickTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}
