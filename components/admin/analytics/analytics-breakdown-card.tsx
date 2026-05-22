import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsGroup } from "@/db/analytics";

export function AnalyticsBreakdownCard({
  title,
  description,
  rows,
  icon,
}: {
  title: string;
  description: string;
  rows: AnalyticsGroup[];
  icon: ReactNode;
}) {
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
            {icon}
          </span>
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <div className="grid gap-3">
            {rows.map((row) => {
              const percent = totalClicks > 0 ? (row.clicks / totalClicks) * 100 : 0;

              return (
                <div key={row.label} className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {row.clicks.toLocaleString()}{" "}
                      {row.clicks === 1 ? "click" : "clicks"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-32 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No click data yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
