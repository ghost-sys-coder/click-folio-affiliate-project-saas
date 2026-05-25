import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import {
  generatedLandingPagesTable,
  type GeneratedLandingPage,
} from "@/db/schema";
import type { LandingPageGenerationInput, LandingPageOutput } from "@/lib/landing-pages";

export async function getLandingPagesForUser(userId: string) {
  return getDb()
    .select()
    .from(generatedLandingPagesTable)
    .where(eq(generatedLandingPagesTable.userId, userId))
    .orderBy(generatedLandingPagesTable.createdAt);
}

export async function getPublishedLandingPagesCount(userId: string) {
  const [result] = await getDb()
    .select({
      count: sql<number>`count(*)`,
    })
    .from(generatedLandingPagesTable)
    .where(
      and(
        eq(generatedLandingPagesTable.userId, userId),
        eq(generatedLandingPagesTable.status, "published")
      )
    );

  return result?.count ?? 0;
}

export async function getLandingPageById(id: string, userId: string) {
  const [row] = await getDb()
    .select()
    .from(generatedLandingPagesTable)
    .where(
      and(
        eq(generatedLandingPagesTable.id, id),
        eq(generatedLandingPagesTable.userId, userId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function createLandingPageDraft(input: {
  userId: string;
  profileId: string;
  affiliateLinkId: string;
  slug: string;
  title: string;
  theme: string;
  inputJson: LandingPageGenerationInput;
  outputJson: LandingPageOutput;
  seoTitle: string;
  seoDescription: string;
}) {
  const [row] = await getDb()
    .insert(generatedLandingPagesTable)
    .values({
      userId: input.userId,
      profileId: input.profileId,
      affiliateLinkId: input.affiliateLinkId,
      slug: input.slug,
      title: input.title,
      theme: input.theme,
      inputJson: input.inputJson,
      outputJson: input.outputJson,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      status: "draft",
    })
    .returning();

  return row;
}

export async function updateLandingPage(
  id: string,
  userId: string,
  data: Partial<Omit<GeneratedLandingPage, "id" | "userId" | "profileId" | "createdAt">>
) {
  const [row] = await getDb()
    .update(generatedLandingPagesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(generatedLandingPagesTable.id, id),
        eq(generatedLandingPagesTable.userId, userId)
      )
    )
    .returning();

  return row ?? null;
}

export async function getLandingPageBySlug(profileId: string, slug: string) {
  const [row] = await getDb()
    .select()
    .from(generatedLandingPagesTable)
    .where(
      and(
        eq(generatedLandingPagesTable.profileId, profileId),
        eq(generatedLandingPagesTable.slug, slug),
        eq(generatedLandingPagesTable.status, "published")
      )
    )
    .limit(1);

  return row ?? null;
}

export async function isSlugAvailable(profileId: string, slug: string, excludeId?: string) {
  const query = and(
    eq(generatedLandingPagesTable.profileId, profileId),
    eq(generatedLandingPagesTable.slug, slug)
  );

  const [row] = await getDb()
    .select({ id: generatedLandingPagesTable.id })
    .from(generatedLandingPagesTable)
    .where(excludeId ? and(query, eq(generatedLandingPagesTable.id, excludeId)) : query)
    .limit(1);

  return !row || (excludeId ? row.id === excludeId : false);
}
