import { BarChart3, Globe2, Laptop, Megaphone, Radio, Share2 } from "lucide-react";

import { AnalyticsBreakdownCard } from "@/components/admin/analytics/analytics-breakdown-card";
import { AnalyticsEmptyState } from "@/components/admin/analytics/analytics-empty-state";
import { AnalyticsStatGrid } from "@/components/admin/analytics/analytics-stat-grid";
import { RecentClicksTable } from "@/components/admin/analytics/recent-clicks-table";
import { TopLinksTable } from "@/components/admin/analytics/top-links-table";
import type {
  AnalyticsGroup,
  ClickSummary,
  RecentClick,
  TopLink,
} from "@/db/analytics";

export function AnalyticsDashboard({
  summary,
  topLinks,
  topSources,
  topMediums,
  topCampaigns,
  recentClicks,
  deviceBreakdown,
  countryBreakdown,
}: {
  summary: ClickSummary;
  topLinks: TopLink[];
  topSources: AnalyticsGroup[];
  topMediums: AnalyticsGroup[];
  topCampaigns: AnalyticsGroup[];
  recentClicks: RecentClick[];
  deviceBreakdown: AnalyticsGroup[];
  countryBreakdown: AnalyticsGroup[];
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Review click performance across affiliate links, campaigns, sources,
          devices, and locations.
        </p>
      </div>

      <AnalyticsStatGrid summary={summary} />

      {summary.totalClicks === 0 ? <AnalyticsEmptyState /> : null}

      <TopLinksTable links={topLinks} />

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsBreakdownCard
          title="Top sources"
          description="Where visitors came from."
          rows={topSources}
          icon={<Share2 className="size-4" />}
        />
        <AnalyticsBreakdownCard
          title="Top mediums"
          description="The channel type for each click."
          rows={topMediums}
          icon={<Radio className="size-4" />}
        />
        <AnalyticsBreakdownCard
          title="Top campaigns"
          description="Campaign names from UTM tracking."
          rows={topCampaigns}
          icon={<Megaphone className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBreakdownCard
          title="Device breakdown"
          description="Clicks grouped by detected device."
          rows={deviceBreakdown}
          icon={<Laptop className="size-4" />}
        />
        <AnalyticsBreakdownCard
          title="Country breakdown"
          description="Clicks grouped by detected country."
          rows={countryBreakdown}
          icon={<Globe2 className="size-4" />}
        />
      </div>

      <RecentClicksTable clicks={recentClicks} />

      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <BarChart3 className="mr-1.5 inline size-3.5 align-text-bottom" />
        Analytics are based on tracked redirects through your public affiliate
        links.
      </div>
    </div>
  );
}
