import { eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { profilesTable, usersTable } from "@/db/schema";
import type { AppTheme } from "@/lib/themes";

export async function getUserByClerkUserId(clerkUserId: string) {
  const [user] = await getDb()
    .select({
      id: usersTable.id,
      clerkUserId: usersTable.clerkUserId,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      imageUrl: usersTable.imageUrl,
      isDeleted: usersTable.isDeleted,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  return user ?? null;
}

export async function getProfileByUserId(userId: string) {
  const [profile] = await getDb()
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function getOnboardingStateByClerkUserId(clerkUserId: string) {
  const [row] = await getDb()
    .select({
      userId: usersTable.id,
      isDeleted: usersTable.isDeleted,
      profileId: profilesTable.id,
      username: profilesTable.username,
    })
    .from(usersTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  if (!row || row.isDeleted) {
    return { userId: null, profileId: null, username: null };
  }

  return {
    userId: row.userId,
    profileId: row.profileId,
    username: row.username,
  };
}

export async function createUserProfile(input: {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  niche: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  targetAudience: string;
  primaryPlatform: string;
  contentTone: string;
  primaryGoal: string;
  defaultButtonLabel: string;
  theme: AppTheme;
  disclosureText: string;
}) {
  const [profile] = await getDb()
    .insert(profilesTable)
    .values({
      userId: input.userId,
      username: input.username,
      displayName: input.displayName,
      bio: input.bio,
      niche: input.niche,
      avatarUrl: input.avatarUrl,
      coverImageUrl: input.coverImageUrl,
      targetAudience: input.targetAudience,
      primaryPlatform: input.primaryPlatform,
      contentTone: input.contentTone,
      primaryGoal: input.primaryGoal,
      defaultButtonLabel: input.defaultButtonLabel,
      theme: input.theme,
      disclosureText: input.disclosureText,
      isPublished: true,
      updatedAt: new Date(),
    })
    .returning();

  return profile;
}
