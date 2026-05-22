"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertClerkUser } from "@/db/clerk-users";
import {
  createUserProfile,
  getProfileByUserId,
  getUserByClerkUserId,
} from "@/db/profiles";
import {
  validateOnboardingForm,
  type OnboardingFormState,
} from "@/lib/onboarding";

export async function completeOnboarding(
  _state: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const validation = validateOnboardingForm(formData);

  if (!validation.ok) {
    return {
      errors: validation.errors,
      values: validation.values,
    };
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  await upsertClerkUser({
    id: clerkUser.id,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    image_url: clerkUser.imageUrl,
    primary_email_address_id: clerkUser.primaryEmailAddressId,
    email_addresses: clerkUser.emailAddresses.map((emailAddress) => ({
      id: emailAddress.id,
      email_address: emailAddress.emailAddress,
    })),
  });

  const appUser = await getUserByClerkUserId(clerkUser.id);

  if (!appUser) {
    return {
      message: "We could not prepare your workspace. Please try again.",
      values: validation.data,
    };
  }

  const existingProfile = await getProfileByUserId(appUser.id);

  if (existingProfile) {
    redirect("/admin");
  }

  try {
    await createUserProfile({
      userId: appUser.id,
      username: validation.data.username,
      displayName: validation.data.displayName,
      bio: validation.data.bio || null,
      niche: validation.data.niche,
      avatarUrl: validation.data.avatarUrl || clerkUser.imageUrl || null,
      coverImageUrl: validation.data.coverImageUrl || null,
      targetAudience: validation.data.targetAudience,
      primaryPlatform: validation.data.primaryPlatform,
      contentTone: validation.data.contentTone,
      primaryGoal: validation.data.primaryGoal,
      defaultButtonLabel: validation.data.defaultButtonLabel,
      theme: validation.data.theme,
      disclosureText: validation.data.disclosureText,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.toLowerCase().includes("username")) {
      return {
        errors: {
          username: "This username is already taken.",
        },
        values: validation.data,
      };
    }

    return {
      message: "We could not create your profile. Please try again.",
      values: validation.data,
    };
  }

  revalidatePath("/admin");
  redirect("/admin");
}
