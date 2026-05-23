import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { affiliateLinksTable, profilesTable } from "@/db/schema";

export type PublicProfile = Awaited<
  ReturnType<typeof getPublicProfileByUsername>
>;

export type PublicAffiliateLink = Awaited<
  ReturnType<typeof getActiveAffiliateLinksByProfileId>
>[number];

export async function getPublicProfileByUsername(username: string) {
  const [profile] = await getDb()
    .select({
      id: profilesTable.id,
      userId: profilesTable.userId,
      username: profilesTable.username,
      displayName: profilesTable.displayName,
      bio: profilesTable.bio,
      niche: profilesTable.niche,
      avatarUrl: profilesTable.avatarUrl,
      coverImageUrl: profilesTable.coverImageUrl,
      theme: profilesTable.theme,
      disclosureText: profilesTable.disclosureText,
      isPublished: profilesTable.isPublished,
    })
    .from(profilesTable)
    .where(eq(profilesTable.username, username))
    .limit(1);

  return profile ?? null;
}

export async function getActiveAffiliateLinksByProfileId(profileId: string) {
  return getDb()
    .select({
      id: affiliateLinksTable.id,
      title: affiliateLinksTable.title,
      description: affiliateLinksTable.description,
      imageUrl: affiliateLinksTable.imageUrl,
      category: affiliateLinksTable.category,
      network: affiliateLinksTable.network,
      price: affiliateLinksTable.price,
      currency: affiliateLinksTable.currency,
      buttonLabel: affiliateLinksTable.buttonLabel,
      sortOrder: affiliateLinksTable.sortOrder,
      createdAt: affiliateLinksTable.createdAt,
    })
    .from(affiliateLinksTable)
    .where(
      and(
        eq(affiliateLinksTable.profileId, profileId),
        eq(affiliateLinksTable.status, "active")
      )
    )
    .orderBy(
      asc(affiliateLinksTable.sortOrder),
      desc(affiliateLinksTable.createdAt)
    );
}
