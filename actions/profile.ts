"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db/drizzle";
import { profilesTable } from "@/db/schema";
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";
import { validateOnboardingForm } from "@/lib/onboarding";

export type ProfileUpdateState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

export async function updateProfile(
  state: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const validation = validateOnboardingForm(formData);

  if (!validation.ok) {
    return {
      errors: validation.errors as Record<string, string>,
      message: "Please fix the errors below.",
    };
  }

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/settings");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user) {
    return { message: "User not found." };
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return { message: "Profile not found." };
  }

  try {
    await getDb()
      .update(profilesTable)
      .set({
        username: validation.data.username,
        displayName: validation.data.displayName,
        bio: validation.data.bio || null,
        niche: validation.data.niche,
        avatarUrl: validation.data.avatarUrl || null,
        coverImageUrl: validation.data.coverImageUrl || null,
        targetAudience: validation.data.targetAudience,
        primaryPlatform: validation.data.primaryPlatform,
        contentTone: validation.data.contentTone,
        primaryGoal: validation.data.primaryGoal,
        defaultButtonLabel: validation.data.defaultButtonLabel,
        theme: validation.data.theme,
        disclosureText: validation.data.disclosureText,
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.id, profile.id));

    revalidatePath("/admin/settings");
    revalidatePath(`/u/${validation.data.username}`);
    
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.toLowerCase().includes("username")) {
      return {
        errors: {
          username: "This username is already taken.",
        },
      };
    }

    return {
      message: "We could not update your profile. Please try again.",
    };
  }
}
