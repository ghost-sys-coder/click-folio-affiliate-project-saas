import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OverviewDashboard } from "@/components/admin/overview/overview-dashboard";
import {
  getClickSummary,
  getRecentClicks,
  getTopLinks,
  getTopSources,
} from "@/db/analytics";
import { getProfileByUserId, getUserById } from "@/db/profiles";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { getUsageSummary } from "@/lib/usage";
import { getRequestOrigin } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "View your affiliate performance, recent clicks, and recommended actions.",
};

export default async function AdminOverviewPage() {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20">
        <h2 className="text-lg font-semibold">Database setup required</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Run migrations to enable the dashboard overview.
        </p>
      </div>
    );
  }

  const userPlan = planResult.plan;
  const [profile, user] = await Promise.all([
    getProfileByUserId(userPlan.userId),
    getUserById(userPlan.userId),
  ]);

  if (!profile || !user) {
    redirect("/onboarding");
  }

  const workspace = {
    userId: userPlan.userId,
    profileId: profile.id,
  };

  const historyDays = userPlan.limits.clickHistoryDays;
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);
  const publicUrl = `${origin}/u/${profile.username}`;
  const referenceDate = new Date();

  const [usage, summary, topLinks, topSources, recentClicks] =
    await Promise.all([
      getUsageSummary(userPlan.userId),
      getClickSummary(workspace, historyDays),
      getTopLinks(workspace, 5, historyDays),
      getTopSources(workspace, 5, historyDays),
      getRecentClicks(workspace, 10, historyDays),
    ]);

  return (
    <div className="mx-auto max-w-6xl">
      <OverviewDashboard
        profile={profile}
        userEmail={user.email}
        userPlan={userPlan}
        usage={usage}
        analytics={{
          summary,
          topLinks,
          topSources,
          recentClicks,
        }}
        publicUrl={publicUrl}
        referenceDate={referenceDate}
      />
    </div>
  );
}