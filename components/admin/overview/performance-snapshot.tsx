import { BarChart3, ExternalLink, Link2, MousePointer2, Share2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsGroup, RecentClick, TopLink } from "@/db/analytics";

type PerformanceSnapshotProps = {
  topLinks: TopLink[];
  topSources: AnalyticsGroup[];
  recentClicks: RecentClick[];
};

export function PerformanceSnapshot({
  topLinks,
  topSources,
  recentClicks,
}: PerformanceSnapshotProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Links */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Top Links</CardTitle>
            <CardDescription>Most clicked affiliate offers.</CardDescription>
          </div>
          <Link2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {topLinks.length > 0 ? (
              topLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{link.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{link.clicks}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No click data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Sources */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Top Sources</CardTitle>
            <CardDescription>Where your traffic is coming from.</CardDescription>
          </div>
          <Share2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {topSources.length > 0 ? (
              topSources.map((source) => (
                <div key={source.label} className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{source.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{source.clicks}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Unknown or direct traffic only.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Clicks - Full Width on Mobile, could be table or list */}
      <Card className="border-border/60 shadow-sm lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest tracked redirects.</CardDescription>
          </div>
          <BarChart3 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {recentClicks.length > 0 ? (
              recentClicks.slice(0, 5).map((click) => (
                <div key={click.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MousePointer2 className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{click.linkTitle}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {click.source} • {click.country} • {click.device}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground">
                    {new Date(click.clickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No clicks tracked recently.</p>
            )}
          </div>
          {recentClicks.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
              <Link href="/admin/analytics">
                View Full Analytics
                <ExternalLink className="ml-2 size-3" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
