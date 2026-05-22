import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PublicProfilePage } from "@/components/public-profile/public-profile-page";
import {
  getActiveAffiliateLinksByProfileId,
  getPublicProfileByUsername,
} from "@/db/public-profiles";

const getCachedPublicProfileByUsername = cache(getPublicProfileByUsername);

type PublicProfileRouteProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PublicProfileRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getCachedPublicProfileByUsername(
    normalizeUsernameParam(username)
  );

  if (!profile || !profile.isPublished) {
    return {
      title: "Profile unavailable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const niche = formatLabel(profile.niche);
  const title = niche
    ? `${profile.displayName} - ${niche} Affiliate Resources`
    : `${profile.displayName} - Affiliate Resources`;
  const description = profile.bio
    ? `${profile.bio} Browse curated affiliate recommendations from ${profile.displayName}.`
    : `Browse curated affiliate recommendations from ${profile.displayName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: profile.coverImageUrl
        ? [
            {
              url: profile.coverImageUrl,
              alt: `${profile.displayName} affiliate profile`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: profile.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: profile.coverImageUrl ? [profile.coverImageUrl] : undefined,
    },
  };
}

export default async function UserPublicProfilePage({
  params,
  searchParams,
}: PublicProfileRouteProps) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const profile = await getCachedPublicProfileByUsername(
    normalizeUsernameParam(username)
  );

  if (!profile || !profile.isPublished) {
    notFound();
  }

  const links = await getActiveAffiliateLinksByProfileId(profile.id);

  return (
    <PublicProfilePage
      profile={profile}
      links={links}
      trackingParams={resolvedSearchParams}
    />
  );
}

function normalizeUsernameParam(username: string) {
  return username.trim().toLowerCase().replace(/^@+/, "");
}

function formatLabel(value: string | null) {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
