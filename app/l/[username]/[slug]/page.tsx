import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { LandingPageRenderer } from "@/components/landing-page/landing-page-renderer";
import { getDb } from "@/db/drizzle";
import { getLandingPageBySlug } from "@/db/landing-pages";
import { profilesTable } from "@/db/schema";
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
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;

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

  return (
    <LandingPageRenderer
      data={landingPage.outputJson as LandingPageOutput}
      theme={landingPage.theme}
      affiliateLinkId={landingPage.affiliateLinkId}
    />
  );
}
