import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CampaignUrlBuilder } from "@/components/admin/campaign-url-builder";
import { getSavedCampaignSummaries } from "@/db/campaigns";
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";
import { getRequestOrigin } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/campaigns");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    redirect("/onboarding");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const requestHeaders = await headers();
  const publicProfileUrl = `${getRequestOrigin(requestHeaders)}/u/${profile.username}`;
  const savedCampaigns = await getSavedCampaignSummaries({
    userId: user.id,
    profileId: profile.id,
  });

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Campaign URLs
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate public profile links with UTM parameters for cleaner click
          attribution.
        </p>
      </div>

      <CampaignUrlBuilder
        publicProfileUrl={publicProfileUrl}
        savedCampaigns={savedCampaigns}
      />
    </div>
  );
}
