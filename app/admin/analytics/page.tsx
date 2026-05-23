import { redirect } from "next/navigation";

import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
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
  const userPlan = await getCurrentUserPlan();

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
    topCampaigns,
    recentClicks,
    deviceBreakdown,
    countryBreakdown,
  ] = await Promise.all([
    getClickSummary(workspace, historyDays),
    getTopLinks(workspace, 5, historyDays),
    getTopSources(workspace, 5, historyDays),
    getTopMediums(workspace, 5, historyDays),
    getTopCampaigns(workspace, 5, historyDays),
    getRecentClicks(workspace, 10, historyDays),
    getDeviceBreakdown(workspace, 5, historyDays),
    getCountryBreakdown(workspace, 5, historyDays),
  ]);

  return (
    <AnalyticsDashboard
      summary={summary}
      topLinks={topLinks}
      topSources={topSources}
      topMediums={topMediums}
      topCampaigns={topCampaigns}
      recentClicks={recentClicks}
      deviceBreakdown={deviceBreakdown}
      countryBreakdown={countryBreakdown}
      analyticsLevel={userPlan.limits.analyticsLevel}
    />
  );
};

export default AnalyticsPage;
