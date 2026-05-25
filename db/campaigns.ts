import { and, count, desc, eq, gte } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { campaignsTable, linkClicksTable } from "@/db/schema";

type CampaignWorkspace = {
  userId: string;
  profileId: string;
};

export type SavedCampaignSummary = {
  id: string;
  name: string;
  source: string;
  medium: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function createOrRefreshCampaignForWorkspace(input: {
  userId: string;
  profileId: string;
  name: string;
  source: string;
  medium: string;
}) {
  const existing = await getCampaignByIdentity(input);
  const now = new Date();

  if (existing) {
    const [campaign] = await getDb()
      .update(campaignsTable)
      .set({
        updatedAt: now,
        endDate: extendCampaignEndDate(existing.endDate),
        status: "active",
      })
      .where(eq(campaignsTable.id, existing.id))
      .returning();

    return campaign;
  }

  const [campaign] = await getDb()
    .insert(campaignsTable)
    .values({
      userId: input.userId,
      profileId: input.profileId,
      name: input.name,
      // Reuse existing columns for saved URL tracking dimensions.
      platform: input.source,
      objective: input.medium,
      startDate: now,
      endDate: extendCampaignEndDate(now),
      status: "active",
      updatedAt: now,
    })
    .returning();

  return campaign;
}

export async function getSavedCampaignSummaries(
  workspace: CampaignWorkspace,
  limit = 20,
  historyDays?: number | string
): Promise<SavedCampaignSummary[]> {
  const historySince = getHistorySince(historyDays);

  const rows = await getDb()
    .select({
      id: campaignsTable.id,
      name: campaignsTable.name,
      source: campaignsTable.platform,
      medium: campaignsTable.objective,
      clicks: count(linkClicksTable.id),
      createdAt: campaignsTable.createdAt,
      updatedAt: campaignsTable.updatedAt,
    })
    .from(campaignsTable)
    .leftJoin(
      linkClicksTable,
      and(
        eq(linkClicksTable.userId, workspace.userId),
        eq(linkClicksTable.profileId, workspace.profileId),
        eq(linkClicksTable.campaign, campaignsTable.name),
        eq(linkClicksTable.source, campaignsTable.platform),
        eq(linkClicksTable.medium, campaignsTable.objective),
        historySince ? gte(linkClicksTable.createdAt, historySince) : undefined
      )
    )
    .where(
      and(
        eq(campaignsTable.userId, workspace.userId),
        eq(campaignsTable.profileId, workspace.profileId)
      )
    )
    .groupBy(
      campaignsTable.id,
      campaignsTable.name,
      campaignsTable.platform,
      campaignsTable.objective,
      campaignsTable.createdAt,
      campaignsTable.updatedAt
    )
    .orderBy(desc(count(linkClicksTable.id)), desc(campaignsTable.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    source: row.source,
    medium: row.medium,
    clicks: Number(row.clicks),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

async function getCampaignByIdentity(input: {
  userId: string;
  profileId: string;
  name: string;
  source: string;
  medium: string;
}) {
  const [campaign] = await getDb()
    .select()
    .from(campaignsTable)
    .where(
      and(
        eq(campaignsTable.userId, input.userId),
        eq(campaignsTable.profileId, input.profileId),
        eq(campaignsTable.name, input.name),
        eq(campaignsTable.platform, input.source),
        eq(campaignsTable.objective, input.medium)
      )
    )
    .limit(1);

  return campaign ?? null;
}

function extendCampaignEndDate(referenceDate: Date) {
  return new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
}

function getHistorySince(days?: number | string) {
  if (!days || days === "unlimited") return undefined;
  const now = new Date();
  return new Date(now.getTime() - Number(days) * 24 * 60 * 60 * 1000);
}
