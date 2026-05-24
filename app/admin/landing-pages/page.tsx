import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { LandingPagesList } from "@/components/admin/landing-pages-list";
import { getDb } from "@/db/drizzle";
import {
  affiliateLinksTable,
  generatedLandingPagesTable,
  profilesTable,
} from "@/db/schema";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export const metadata: Metadata = {
  title: "Landing Pages",
  description: "Manage your generated affiliate landing pages.",
};

export default async function LandingPagesPage() {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    redirect("/admin");
  }

  const userId = planResult.plan.userId;

  const landingPages = await getDb()
    .select({
      id: generatedLandingPagesTable.id,
      title: generatedLandingPagesTable.title,
      slug: generatedLandingPagesTable.slug,
      status: generatedLandingPagesTable.status,
      theme: generatedLandingPagesTable.theme,
      createdAt: generatedLandingPagesTable.createdAt,
      linkTitle: affiliateLinksTable.title,
      username: profilesTable.username,
    })
    .from(generatedLandingPagesTable)
    .innerJoin(
      affiliateLinksTable,
      eq(generatedLandingPagesTable.affiliateLinkId, affiliateLinksTable.id)
    )
    .innerJoin(
      profilesTable,
      eq(generatedLandingPagesTable.profileId, profilesTable.id)
    )
    .where(eq(generatedLandingPagesTable.userId, userId))
    .orderBy(generatedLandingPagesTable.createdAt);

  return <LandingPagesList landingPages={landingPages} />;
}
