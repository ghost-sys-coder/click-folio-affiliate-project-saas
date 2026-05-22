import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import {
  affiliateLinksTable,
  generatedPostsTable,
  type AffiliateLink,
  type GeneratedPost,
} from "@/db/schema";
import {
  contentStudioGoals,
  contentStudioTones,
} from "@/lib/content-studio";
import type {
  ContentStudioOutput,
  ContentStudioRequest,
} from "@/lib/content-studio";

export type ContentStudioAffiliateLink = Pick<
  AffiliateLink,
  | "id"
  | "title"
  | "description"
  | "destinationUrl"
  | "category"
  | "network"
  | "price"
  | "currency"
  | "buttonLabel"
>;

export type RecentGeneratedPost = {
  id: string;
  linkTitle: string;
  platform: ContentStudioRequest["platform"];
  goal: (typeof contentStudioGoals)[number];
  audience: string;
  tone: (typeof contentStudioTones)[number];
  generatedText: string;
  outputJson: unknown;
  createdAt: Date;
};

export type GeneratedPostDetail = RecentGeneratedPost & {
  audience: string;
  extraContext: string | null;
  linkId: string;
};

export async function getActiveAffiliateLinksForContentStudio(userId: string) {
  return getDb()
    .select({
      id: affiliateLinksTable.id,
      title: affiliateLinksTable.title,
      description: affiliateLinksTable.description,
      destinationUrl: affiliateLinksTable.destinationUrl,
      category: affiliateLinksTable.category,
      network: affiliateLinksTable.network,
      price: affiliateLinksTable.price,
      currency: affiliateLinksTable.currency,
      buttonLabel: affiliateLinksTable.buttonLabel,
    })
    .from(affiliateLinksTable)
    .where(
      and(
        eq(affiliateLinksTable.userId, userId),
        eq(affiliateLinksTable.status, "active")
      )
    )
    .orderBy(desc(affiliateLinksTable.createdAt));
}

export async function getContentStudioAffiliateLinkForUser(
  userId: string,
  linkId: string
): Promise<ContentStudioAffiliateLink | null> {
  const [link] = await getDb()
    .select({
      id: affiliateLinksTable.id,
      title: affiliateLinksTable.title,
      description: affiliateLinksTable.description,
      destinationUrl: affiliateLinksTable.destinationUrl,
      category: affiliateLinksTable.category,
      network: affiliateLinksTable.network,
      price: affiliateLinksTable.price,
      currency: affiliateLinksTable.currency,
      buttonLabel: affiliateLinksTable.buttonLabel,
    })
    .from(affiliateLinksTable)
    .where(
      and(
        eq(affiliateLinksTable.id, linkId),
        eq(affiliateLinksTable.userId, userId),
        eq(affiliateLinksTable.status, "active")
      )
    )
    .limit(1);

  return link ?? null;
}

export async function createGeneratedPostForUser(input: {
  userId: string;
  request: ContentStudioRequest;
  outputJson: ContentStudioOutput;
  generatedText: string;
}): Promise<GeneratedPost> {
  const [post] = await getDb()
    .insert(generatedPostsTable)
    .values({
      userId: input.userId,
      linkId: input.request.linkId,
      platform: input.request.platform,
      goal: input.request.goal,
      audience: input.request.audience,
      tone: input.request.tone,
      extraContext: input.request.extraContext ?? null,
      outputJson: input.outputJson,
      generatedText: input.generatedText,
    })
    .returning();

  return post;
}

export async function getRecentGeneratedPostsForUser(
  userId: string,
  limit = 6
): Promise<RecentGeneratedPost[]> {
  const rows = await getDb()
    .select({
      id: generatedPostsTable.id,
      linkTitle: affiliateLinksTable.title,
      platform: generatedPostsTable.platform,
      goal: generatedPostsTable.goal,
      audience: generatedPostsTable.audience,
      tone: generatedPostsTable.tone,
      generatedText: generatedPostsTable.generatedText,
      outputJson: generatedPostsTable.outputJson,
      createdAt: generatedPostsTable.createdAt,
    })
    .from(generatedPostsTable)
    .innerJoin(
      affiliateLinksTable,
      eq(affiliateLinksTable.id, generatedPostsTable.linkId)
    )
    .where(eq(generatedPostsTable.userId, userId))
    .orderBy(desc(generatedPostsTable.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    platform: row.platform as ContentStudioRequest["platform"],
    goal: row.goal as (typeof contentStudioGoals)[number],
    tone: row.tone as (typeof contentStudioTones)[number],
  }));
}

export async function getGeneratedPostForUser(
  userId: string,
  id: string
): Promise<GeneratedPostDetail | null> {
  const [post] = await getDb()
    .select({
      id: generatedPostsTable.id,
      linkId: generatedPostsTable.linkId,
      linkTitle: affiliateLinksTable.title,
      platform: generatedPostsTable.platform,
      goal: generatedPostsTable.goal,
      audience: generatedPostsTable.audience,
      tone: generatedPostsTable.tone,
      extraContext: generatedPostsTable.extraContext,
      generatedText: generatedPostsTable.generatedText,
      outputJson: generatedPostsTable.outputJson,
      createdAt: generatedPostsTable.createdAt,
    })
    .from(generatedPostsTable)
    .innerJoin(
      affiliateLinksTable,
      eq(affiliateLinksTable.id, generatedPostsTable.linkId)
    )
    .where(
      and(
        eq(generatedPostsTable.id, id),
        eq(generatedPostsTable.userId, userId)
      )
    )
    .limit(1);

  if (!post) {
    return null;
  }

  return {
    ...post,
    platform: post.platform as ContentStudioRequest["platform"],
    goal: post.goal as (typeof contentStudioGoals)[number],
    tone: post.tone as (typeof contentStudioTones)[number],
  };
}
