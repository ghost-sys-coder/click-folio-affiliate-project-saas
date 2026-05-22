import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import {
  affiliateLinksTable,
  generatedPostsTable,
  type AffiliateLink,
  type GeneratedPost,
} from "@/db/schema";
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
  platform: string;
  goal: string;
  audience: string;
  tone: string;
  generatedText: string;
  outputJson: unknown;
  createdAt: Date;
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
  return getDb()
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
}
