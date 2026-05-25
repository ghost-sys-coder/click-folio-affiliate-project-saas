import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { LandingPageRenderer } from "@/components/landing-page/landing-page-renderer";
import { getDb } from "@/db/drizzle";
import { getLandingPageBySlug } from "@/db/landing-pages";
import { createLandingPageView } from "@/db/landing-page-views";
import { profilesTable } from "@/db/schema";
import {
  buildLandingPageTrackingInput,
  hasTrackingPrefetchHeaders,
} from "@/lib/click-tracking";
import type { LandingPageOutput } from "@/lib/landing-pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;

  const [profile] = await getDb()
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, username))
    .limit(1);

  if (!profile) return {};

  const landingPage = await getLandingPageBySlug(profile.id, slug);
  if (!landingPage) return {};

  return {
    title: landingPage.seoTitle || landingPage.title,
    description: landingPage.seoDescription,
  };
}

export default async function PublicLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { username, slug } = await params;
  const resolvedSearchParams = await searchParams;

  const [profile] = await getDb()
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, username))
    .limit(1);

  if (!profile) {
    notFound();
  }

  const landingPage = await getLandingPageBySlug(profile.id, slug);

  if (!landingPage) {
    notFound();
  }

  const requestHeaders = await headers();

  if (!hasTrackingPrefetchHeaders(requestHeaders)) {
    try {
      await createLandingPageView(
        await buildLandingPageTrackingInput(
          {
            headers: requestHeaders,
            searchParams: resolvedSearchParams,
          },
          {
            landingPageId: landingPage.id,
            affiliateLinkId: landingPage.affiliateLinkId,
            profileId: landingPage.profileId,
            userId: landingPage.userId,
          }
        )
      );
    } catch {
      // View tracking should never block the page from rendering.
    }
  }

  return (
    <LandingPageRenderer
      data={landingPage.outputJson as LandingPageOutput}
      theme={landingPage.theme}
      affiliateLinkId={landingPage.affiliateLinkId}
      trackingParams={resolvedSearchParams}
    />
  );
}
