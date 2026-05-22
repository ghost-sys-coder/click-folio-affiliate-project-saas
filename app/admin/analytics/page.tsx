import { auth } from "@clerk/nextjs/server";
import { BarChart3 } from "lucide-react";
import { redirect } from "next/navigation";

import {
  getTopClickCampaignsForWorkspace,
  getTopClickMediumsForWorkspace,
  getTopClickSourcesForWorkspace,
  type TopClickGroup,
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
  const [sources, mediums, campaigns] = await Promise.all([
    getTopClickSourcesForWorkspace(workspace),
    getTopClickMediumsForWorkspace(workspace),
    getTopClickCampaignsForWorkspace(workspace),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Review grouped click attribution from your public profile links.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TopClicksSection title="Top sources" rows={sources} />
        <TopClicksSection title="Top mediums" rows={mediums} />
        <TopClicksSection title="Top campaigns" rows={campaigns} />
      </div>
    </div>
  );
};

function TopClicksSection({
  title,
  rows,
}: {
  title: string;
  rows: TopClickGroup[];
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
          <BarChart3 className="size-4" />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm font-medium">
                {row.label}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {row.clicks} {row.clicks === 1 ? "click" : "clicks"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-32 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          No click data yet.
        </div>
      )}
    </section>
  );
}

export default AnalyticsPage;
