"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/drizzle";
import { profilesTable } from "@/db/schema";
import { getProfileByUserId } from "@/db/profiles";
import { validateOnboardingForm } from "@/lib/onboarding";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export type ProfileUpdateState = {
  errors?: Record<string, string>;
  message: string;
  success: boolean;
};

export async function updateProfile(
  state: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const validation = validateOnboardingForm(formData);

  if (!validation.ok) {
    return {
      success: false,
      errors: validation.errors as Record<string, string>,
      message: "Please fix the errors below.",
    };
  }

  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
      return {
          success: false,
          message: planResult.error === "database-setup-required"
              ? "Database setup required. Run migrations to enable profile settings."
              : "An unexpected error occurred. Please try again."
      };
  }

  const userPlan = planResult.plan;

  if (userPlan.status === "expired") {
    return { success: false, message: "Your trial has expired. Upgrade to continue updating your profile." };
  }

  // Enforce theme limits
  if (!userPlan.limits.customThemes && validation.data.theme !== "growth-mint") {
      return {
          success: false,
          message: `The ${validation.data.theme} theme is only available on premium plans. Upgrade to use custom themes.`,
          errors: {
              theme: "Custom themes are a premium feature."
          }
      };
  }

  const profile = await getProfileByUserId(userPlan.userId);

  if (!profile) {
    return { success: false, message: "Profile not found." };
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
        success: false,
        message: "This username is already taken.",
        errors: {
          username: "This username is already taken.",
        },
      };
    }

    return {
      success: false,
      message: "We could not update your profile. Please try again.",
    };
  }
}
