import { redirect } from "next/navigation";

import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
import { getSavedCampaignSummaries } from "@/db/campaigns";
import {
  getClickSummary,
  getCountryBreakdown,
  getDeviceBreakdown,
  getRecentClicks,
  getTopCampaigns,
  getTopLinks,
  getTopMediums,
  getTopSources,
} from "@/db/analytics";
import { getProfileByUserId } from "@/db/profiles";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

const AnalyticsPage = async () => {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return (
        <div className="flex flex-col items-center justify-center min-h-100 border border-dashed rounded-xl bg-muted/20">
            <h2 className="text-lg font-semibold">Database setup required</h2>
            <p className="text-muted-foreground text-sm mt-1">Run migrations to enable analytics.</p>
        </div>
    );
  }

  const userPlan = planResult.plan;

  const profile = await getProfileByUserId(userPlan.userId);

  if (!profile) {
    redirect("/onboarding");
  }

  const workspace = {
    userId: userPlan.userId,
    profileId: profile.id,
  };

  const historyDays = userPlan.limits.clickHistoryDays;

  const [
    summary,
    topLinks,
    topSources,
    topMediums,
    recentClicks,
    deviceBreakdown,
    countryBreakdown,
    savedCampaigns,
  ] = await Promise.all([
    getClickSummary(workspace, historyDays),
    getTopLinks(workspace, 5, historyDays),
    getTopSources(workspace, 5, historyDays),
    getTopMediums(workspace, 5, historyDays),
    getRecentClicks(workspace, 10, historyDays),
    getDeviceBreakdown(workspace, 5, historyDays),
    getCountryBreakdown(workspace, 5, historyDays),
    getSavedCampaignSummaries(workspace, 5, historyDays),
  ]);

  const topCampaigns =
    savedCampaigns.length > 0
      ? savedCampaigns.map((campaign) => ({
          label: campaign.name,
          clicks: campaign.clicks,
        }))
      : await getTopCampaigns(workspace, 5, historyDays);

  return (
    <AnalyticsDashboard
      summary={summary}
      topLinks={topLinks}
      topSources={topSources}
      topMediums={topMediums}
      topCampaigns={topCampaigns}
      savedCampaigns={savedCampaigns}
      recentClicks={recentClicks}
      deviceBreakdown={deviceBreakdown}
      countryBreakdown={countryBreakdown}
      analyticsLevel={userPlan.limits.analyticsLevel}
    />
  );
};

export default AnalyticsPage;
