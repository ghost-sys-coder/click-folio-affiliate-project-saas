import { BarChart3, Globe2, Laptop, Megaphone, Radio, Share2 } from "lucide-react";

import { AnalyticsBreakdownCard } from "@/components/admin/analytics/analytics-breakdown-card";
import { AnalyticsEmptyState } from "@/components/admin/analytics/analytics-empty-state";
import { AnalyticsStatGrid } from "@/components/admin/analytics/analytics-stat-grid";
import { RecentClicksTable } from "@/components/admin/analytics/recent-clicks-table";
import { TopLinksTable } from "@/components/admin/analytics/top-links-table";
import { UpgradePrompt } from "@/components/admin/analytics/upgrade-prompt";
import type {
  AnalyticsGroup,
  ClickSummary,
  RecentClick,
  TopLink,
} from "@/db/analytics";
import type { SavedCampaignSummary } from "@/db/campaigns";
import type { AnalyticsLevel } from "@/lib/plans";

export function AnalyticsDashboard({
  summary,
  topLinks,
  topSources,
  topMediums,
  topCampaigns,
  savedCampaigns,
  recentClicks,
  deviceBreakdown,
  countryBreakdown,
  analyticsLevel = "basic",
}: {
  summary: ClickSummary;
  topLinks: TopLink[];
  topSources: AnalyticsGroup[];
  topMediums: AnalyticsGroup[];
  topCampaigns: AnalyticsGroup[];
  savedCampaigns: SavedCampaignSummary[];
  recentClicks: RecentClick[];
  deviceBreakdown: AnalyticsGroup[];
  countryBreakdown: AnalyticsGroup[];
  analyticsLevel?: AnalyticsLevel;
}) {
  const isAdvanced = analyticsLevel === "advanced" || analyticsLevel === "premium";
  const isPremium = analyticsLevel === "premium";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 pb-10">
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

      {isAdvanced ? (
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
            description="Saved campaign URLs tracked by campaign name."
            rows={topCampaigns}
            icon={<Megaphone className="size-4" />}
          />
        </div>
      ) : (
        <UpgradePrompt 
          title="Campaign & Source Tracking" 
          description="Unlock deep insights into where your traffic is coming from and which campaigns are performing best."
          plan="Pro"
        />
      )}

      {isPremium ? (
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
      ) : isAdvanced ? (
        <UpgradePrompt 
          title="Device & Location Insights" 
          description="Understand your audience better by seeing which devices they use and where in the world they are located."
          plan="Creator Plus"
        />
      ) : null}

      {isAdvanced && savedCampaigns.length > 0 ? (
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Saved campaign tracking</h2>
              <p className="text-xs text-muted-foreground">
                Campaigns you have saved from the builder, matched by source, medium, and campaign name.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{campaign.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {campaign.source} • {campaign.medium}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {campaign.clicks.toLocaleString()} clicks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <RecentClicksTable clicks={recentClicks} />

      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <BarChart3 className="mr-1.5 inline size-3.5 align-text-bottom" />
        Analytics are based on tracked redirects through your public affiliate
        links. Click history is limited to {analyticsLevel === 'basic' ? '7' : analyticsLevel === 'advanced' ? '365' : 'unlimited'} days on your current plan.
      </div>
    </div>
  );
}
