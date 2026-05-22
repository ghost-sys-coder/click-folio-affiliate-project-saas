import { and, count, desc, eq, gte } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { affiliateLinksTable, linkClicksTable } from "@/db/schema";
import {
  formatAnalyticsGroupLabel,
  getClickSummaryPeriodStarts,
} from "@/lib/analytics-formatting";

export type AnalyticsWorkspace = {
  profileId: string;
  userId: string;
};

export type ClickSummary = {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
};

export type AnalyticsGroup = {
  label: string;
  clicks: number;
};

export type TopLink = {
  id: string;
  title: string;
  clicks: number;
};

export type RecentClick = {
  id: string;
  linkTitle: string;
  source: string;
  medium: string;
  campaign: string;
  country: string;
  device: string;
  clickedAt: Date;
};

export async function getClickSummary(
  workspace: AnalyticsWorkspace
): Promise<ClickSummary> {
  const { today, week, month } = getClickSummaryPeriodStarts();
  const [totalClicks, clicksToday, clicksThisWeek, clicksThisMonth] =
    await Promise.all([
      countClicks(workspace),
      countClicks(workspace, today),
      countClicks(workspace, week),
      countClicks(workspace, month),
    ]);

  return {
    totalClicks,
    clicksToday,
    clicksThisWeek,
    clicksThisMonth,
  };
}

export async function getTopLinks(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<TopLink[]> {
  const rows = await getDb()
    .select({
      id: affiliateLinksTable.id,
      title: affiliateLinksTable.title,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .innerJoin(
      affiliateLinksTable,
      eq(affiliateLinksTable.id, linkClicksTable.affiliateLinkId)
    )
    .where(workspaceWhere(workspace))
    .groupBy(affiliateLinksTable.id, affiliateLinksTable.title)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    clicks: Number(row.clicks),
  }));
}

export async function getTopSources(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<AnalyticsGroup[]> {
  const rows = await getDb()
    .select({
      value: linkClicksTable.source,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(workspaceWhere(workspace))
    .groupBy(linkClicksTable.source)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    label: formatAnalyticsGroupLabel("source", row.value),
    clicks: Number(row.clicks),
  }));
}

export async function getTopMediums(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<AnalyticsGroup[]> {
  const rows = await getDb()
    .select({
      value: linkClicksTable.medium,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(workspaceWhere(workspace))
    .groupBy(linkClicksTable.medium)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    label: formatAnalyticsGroupLabel("medium", row.value),
    clicks: Number(row.clicks),
  }));
}

export async function getTopCampaigns(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<AnalyticsGroup[]> {
  const rows = await getDb()
    .select({
      value: linkClicksTable.campaign,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(workspaceWhere(workspace))
    .groupBy(linkClicksTable.campaign)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    label: formatAnalyticsGroupLabel("campaign", row.value),
    clicks: Number(row.clicks),
  }));
}

export async function getRecentClicks(
  workspace: AnalyticsWorkspace,
  limit = 10
): Promise<RecentClick[]> {
  const rows = await getDb()
    .select({
      id: linkClicksTable.id,
      linkTitle: affiliateLinksTable.title,
      source: linkClicksTable.source,
      medium: linkClicksTable.medium,
      campaign: linkClicksTable.campaign,
      country: linkClicksTable.country,
      device: linkClicksTable.deviceType,
      clickedAt: linkClicksTable.createdAt,
    })
    .from(linkClicksTable)
    .innerJoin(
      affiliateLinksTable,
      eq(affiliateLinksTable.id, linkClicksTable.affiliateLinkId)
    )
    .where(workspaceWhere(workspace))
    .orderBy(desc(linkClicksTable.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    linkTitle: row.linkTitle,
    source: formatAnalyticsGroupLabel("source", row.source),
    medium: formatAnalyticsGroupLabel("medium", row.medium),
    campaign: formatAnalyticsGroupLabel("campaign", row.campaign),
    country: formatAnalyticsGroupLabel("country", row.country),
    device: formatAnalyticsGroupLabel("device", row.device),
    clickedAt: row.clickedAt,
  }));
}

export async function getDeviceBreakdown(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<AnalyticsGroup[]> {
  const rows = await getDb()
    .select({
      value: linkClicksTable.deviceType,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(workspaceWhere(workspace))
    .groupBy(linkClicksTable.deviceType)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    label: formatAnalyticsGroupLabel("device", row.value),
    clicks: Number(row.clicks),
  }));
}

export async function getCountryBreakdown(
  workspace: AnalyticsWorkspace,
  limit = 5
): Promise<AnalyticsGroup[]> {
  const rows = await getDb()
    .select({
      value: linkClicksTable.country,
      clicks: count(linkClicksTable.id),
    })
    .from(linkClicksTable)
    .where(workspaceWhere(workspace))
    .groupBy(linkClicksTable.country)
    .orderBy(desc(count(linkClicksTable.id)))
    .limit(limit);

  return rows.map((row) => ({
    label: formatAnalyticsGroupLabel("country", row.value),
    clicks: Number(row.clicks),
  }));
}

async function countClicks(workspace: AnalyticsWorkspace, since?: Date) {
  const [row] = await getDb()
    .select({ clicks: count(linkClicksTable.id) })
    .from(linkClicksTable)
    .where(
      since
        ? and(workspaceWhere(workspace), gte(linkClicksTable.createdAt, since))
        : workspaceWhere(workspace)
    );

  return Number(row?.clicks ?? 0);
}

function workspaceWhere(workspace: AnalyticsWorkspace) {
  return and(
    eq(linkClicksTable.userId, workspace.userId),
    eq(linkClicksTable.profileId, workspace.profileId)
  );
}
