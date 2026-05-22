import { and, count, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { linkClicksTable } from "@/db/schema";

export type AnalyticsWorkspace = {
  profileId: string;
  userId: string;
};

export type TopClickGroup = {
  label: string;
  clicks: number;
};

const defaultLabels = {
  source: "Direct or untagged",
  medium: "Unknown medium",
  campaign: "Uncategorized campaign",
} as const;

export async function getTopClickSourcesForWorkspace(
  workspace: AnalyticsWorkspace,
  limit = 5
) {
  const rows = await getDb()
    .select({
      value: linkClicksTable.source,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(
      and(
        eq(linkClicksTable.profileId, workspace.profileId),
        eq(linkClicksTable.userId, workspace.userId)
      )
    )
    .groupBy(linkClicksTable.source)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => toTopClickGroup(row.value, row.clicks, defaultLabels.source));
}

export async function getTopClickMediumsForWorkspace(
  workspace: AnalyticsWorkspace,
  limit = 5
) {
  const rows = await getDb()
    .select({
      value: linkClicksTable.medium,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(
      and(
        eq(linkClicksTable.profileId, workspace.profileId),
        eq(linkClicksTable.userId, workspace.userId)
      )
    )
    .groupBy(linkClicksTable.medium)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => toTopClickGroup(row.value, row.clicks, defaultLabels.medium));
}

export async function getTopClickCampaignsForWorkspace(
  workspace: AnalyticsWorkspace,
  limit = 5
) {
  const rows = await getDb()
    .select({
      value: linkClicksTable.campaign,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(
      and(
        eq(linkClicksTable.profileId, workspace.profileId),
        eq(linkClicksTable.userId, workspace.userId)
      )
    )
    .groupBy(linkClicksTable.campaign)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => toTopClickGroup(row.value, row.clicks, defaultLabels.campaign));
}

function toTopClickGroup(
  value: string | null,
  clicks: number,
  defaultLabel: string
): TopClickGroup {
  return {
    label: value?.trim() || defaultLabel,
    clicks,
  };
}
