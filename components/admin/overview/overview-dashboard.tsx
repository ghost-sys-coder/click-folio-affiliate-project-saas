import { OverviewHeader } from "./overview-header";
import { OverviewKPIGrid } from "./overview-kpi-grid";
import { ProfileStatusCard } from "./profile-status-card";
import { PerformanceSnapshot } from "./performance-snapshot";
import { UsageLimitsCard } from "./usage-limits-card";
import { RecommendedActions } from "./recommended-actions";
import type { UserPlan } from "@/lib/subscriptions";
import type { Profile } from "@/db/schema";
import type { AnalyticsGroup, ClickSummary, RecentClick, TopLink } from "@/db/analytics";

type OverviewDashboardProps = {
  profile: Profile;
  userPlan: UserPlan;
  usage: {
    monthlyContentGenerations: number;
    totalAffiliateLinks: number;
  };
  analytics: {
    summary: ClickSummary;
    topLinks: TopLink[];
    topSources: AnalyticsGroup[];
    recentClicks: RecentClick[];
  };
  publicUrl: string;
  referenceDate: Date;
};

export function OverviewDashboard({
  profile,
  userPlan,
  usage,
  analytics,
  publicUrl,
  referenceDate,
}: OverviewDashboardProps) {
  const hasUtmData = analytics.topSources.some(s => s.label !== "Direct or untagged");

  return (
    <div className="space-y-8 pb-10">
      <OverviewHeader 
        displayName={profile.displayName} 
        publicUrl={publicUrl} 
        planLabel={userPlan.limits.label}
      />

      <OverviewKPIGrid 
        totalClicks={analytics.summary.totalClicks}
        clicksToday={analytics.summary.clicksToday}
        activeLinks={usage.totalAffiliateLinks}
        contentGenerations={usage.monthlyContentGenerations}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecommendedActions 
            activeLinksCount={usage.totalAffiliateLinks}
            totalClicks={analytics.summary.totalClicks}
            hasUtmData={hasUtmData}
            contentGenerationsUsed={usage.monthlyContentGenerations}
            hasDisclosure={!!profile.disclosureText}
            userPlan={userPlan}
            publicUrl={publicUrl}
            referenceDate={referenceDate}
          />
          
          <PerformanceSnapshot 
            topLinks={analytics.topLinks}
            topSources={analytics.topSources}
            recentClicks={analytics.recentClicks}
          />
        </div>

        <div className="space-y-6">
          <ProfileStatusCard 
            isPublished={profile.isPublished}
            publicUrl={publicUrl}
            activeLinksCount={usage.totalAffiliateLinks}
            hasDisclosure={!!profile.disclosureText}
            theme={profile.theme || "growth-mint"}
            removeBranding={userPlan.limits.removeBranding}
          />
          
          <UsageLimitsCard 
            userPlan={userPlan}
            monthlyContentGenerations={usage.monthlyContentGenerations}
            totalAffiliateLinks={usage.totalAffiliateLinks}
            referenceDate={referenceDate}
          />
        </div>
      </div>
    </div>
  );
}
