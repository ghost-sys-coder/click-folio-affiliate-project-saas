import { auth } from "@clerk/nextjs/server";
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
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";

export const dynamic = "force-dynamic";

const AnalyticsPage = async () => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/analytics");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    redirect("/onboarding");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const workspace = {
    userId: user.id,
    profileId: profile.id,
  };
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
    getClickSummary(workspace),
    getTopLinks(workspace),
    getTopSources(workspace),
    getTopMediums(workspace),
    getTopCampaigns(workspace),
    getRecentClicks(workspace),
    getDeviceBreakdown(workspace),
    getCountryBreakdown(workspace),
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
    />
  );
};

export default AnalyticsPage;
