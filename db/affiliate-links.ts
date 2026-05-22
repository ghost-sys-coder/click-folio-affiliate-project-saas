import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import {
  affiliateLinksTable,
  profilesTable,
  usersTable,
  type AffiliateLink,
} from "@/db/schema";
import type {
  AffiliateLinkStatus,
  ValidAffiliateLinkInput,
} from "@/lib/affiliate-links";
import { getDatabaseReadError } from "@/lib/database-errors";

export type AffiliateLinkWorkspace = {
  userId: string;
  profileId: string;
  defaultButtonLabel: string;
};

export type AffiliateLinksReadResult =
  | { ok: true; links: AffiliateLink[] }
  | ReturnType<typeof getDatabaseReadError>;

export async function getAffiliateLinkWorkspaceByClerkUserId(
  clerkUserId: string
): Promise<AffiliateLinkWorkspace | null> {
  const [row] = await getDb()
    .select({
      userId: usersTable.id,
      profileId: profilesTable.id,
      defaultButtonLabel: profilesTable.defaultButtonLabel,
    })
    .from(usersTable)
    .innerJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
    .where(
      and(
        eq(usersTable.clerkUserId, clerkUserId),
        eq(usersTable.isDeleted, false)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    userId: row.userId,
    profileId: row.profileId,
    defaultButtonLabel: row.defaultButtonLabel ?? "View Deal",
  };
}

export async function getAffiliateLinksForWorkspace(userId: string) {
  return getDb()
    .select()
    .from(affiliateLinksTable)
    .where(eq(affiliateLinksTable.userId, userId))
    .orderBy(
      asc(affiliateLinksTable.sortOrder),
      desc(affiliateLinksTable.createdAt)
    );
}

export async function safeGetAffiliateLinksForWorkspace(
  userId: string
): Promise<AffiliateLinksReadResult> {
  try {
    return {
      ok: true,
      links: await getAffiliateLinksForWorkspace(userId),
    };
  } catch (error) {
    return getDatabaseReadError(error);
  }
}

export async function getAffiliateLinkForWorkspace(
  userId: string,
  linkId: string
) {
  const [link] = await getDb()
    .select()
    .from(affiliateLinksTable)
    .where(
      and(eq(affiliateLinksTable.id, linkId), eq(affiliateLinksTable.userId, userId))
    )
    .limit(1);

  return link ?? null;
}

export async function createAffiliateLinkForWorkspace(input: {
  userId: string;
  profileId: string;
  data: ValidAffiliateLinkInput;
}) {
  const [link] = await getDb()
    .insert(affiliateLinksTable)
    .values(toAffiliateLinkWrite(input.userId, input.profileId, input.data))
    .returning();

  return link;
}

export async function updateAffiliateLinkForWorkspace(input: {
  id: string;
  userId: string;
  profileId: string;
  data: ValidAffiliateLinkInput;
}) {
  const [link] = await getDb()
    .update(affiliateLinksTable)
    .set({
      ...toAffiliateLinkWrite(input.userId, input.profileId, input.data),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(affiliateLinksTable.id, input.id),
        eq(affiliateLinksTable.userId, input.userId)
      )
    )
    .returning();

  return link ?? null;
}

export async function setAffiliateLinkStatusForWorkspace(input: {
  id: string;
  userId: string;
  status: AffiliateLinkStatus;
}) {
  const [link] = await getDb()
    .update(affiliateLinksTable)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(affiliateLinksTable.id, input.id),
        eq(affiliateLinksTable.userId, input.userId)
      )
    )
    .returning();

  return link ?? null;
}

export async function deleteAffiliateLinkForWorkspace(input: {
  id: string;
  userId: string;
}) {
  const [link] = await getDb()
    .delete(affiliateLinksTable)
    .where(
      and(
        eq(affiliateLinksTable.id, input.id),
        eq(affiliateLinksTable.userId, input.userId)
      )
    )
    .returning({ id: affiliateLinksTable.id });

  return link ?? null;
}

function toAffiliateLinkWrite(
  userId: string,
  profileId: string,
  data: ValidAffiliateLinkInput
): Omit<AffiliateLink, "id" | "createdAt" | "updatedAt" | "trackingSlug"> {
  return {
    userId,
    profileId,
    title: data.title,
    description: data.description,
    destinationUrl: data.destinationUrl,
    imageUrl: data.imageUrl,
    category: data.category,
    network: data.network,
    commissionType: data.commissionType,
    commissionValue: data.commissionValue,
    price: data.price,
    currency: data.currency,
    buttonLabel: data.buttonLabel,
    status: data.status,
    sortOrder: data.sortOrder,
  };
}
