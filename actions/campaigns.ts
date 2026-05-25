"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSavedCampaignSummaries, createOrRefreshCampaignForWorkspace, type SavedCampaignSummary } from "@/db/campaigns";
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";
import {
  buildCampaignUrl,
  campaignUrlInputSchema,
  type CampaignUrlInput,
} from "@/lib/campaign-url";
import { recordUsageEvent } from "@/lib/usage";

export type CampaignBuilderState = {
  values: CampaignUrlInput;
  errors?: Partial<Record<keyof CampaignUrlInput, string>>;
  message?: string;
  generatedUrl?: string;
  savedCampaign?: SavedCampaignSummary;
};

export async function saveCampaignUrl(
  state: CampaignBuilderState,
  formData: FormData
): Promise<CampaignBuilderState> {
  const publicProfileUrl = String(formData.get("publicProfileUrl") ?? "");
  const values: CampaignUrlInput = {
    source: String(formData.get("source") ?? ""),
    medium: String(formData.get("medium") ?? ""),
    campaign: String(formData.get("campaign") ?? ""),
    content: normalizeOptionalField(formData.get("content")),
    term: normalizeOptionalField(formData.get("term")),
  };

  const parsed = campaignUrlInputSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
      errors: toFieldErrors(parsed.error.issues),
      message: "Complete the required campaign fields to save this URL.",
    };
  }

  const workspace = await requireCampaignWorkspace();
  const generatedUrl = buildCampaignUrl(publicProfileUrl, parsed.data);

  try {
    await createOrRefreshCampaignForWorkspace({
      userId: workspace.user.id,
      profileId: workspace.profile.id,
      name: parsed.data.campaign,
      source: parsed.data.source,
      medium: parsed.data.medium,
    });

    await recordUsageEvent(workspace.user.id, "campaign_url_generated", {
      source: parsed.data.source,
      medium: parsed.data.medium,
      campaign: parsed.data.campaign,
    });

    const [savedCampaign] = await getSavedCampaignSummaries(
      {
        userId: workspace.user.id,
        profileId: workspace.profile.id,
      },
      1
    );

    revalidatePath("/admin/campaigns");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin");

    return {
      values: parsed.data,
      generatedUrl,
      message: "Campaign saved. Share this URL to start tracking campaign clicks.",
      savedCampaign,
    };
  } catch {
    return {
      values: parsed.data,
      generatedUrl,
      message: "We could not save this campaign right now. Check your database setup and try again.",
    };
  }
}

async function requireCampaignWorkspace() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/campaigns");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    redirect("/onboarding");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return { user, profile };
}

function normalizeOptionalField(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function toFieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  return issues.reduce<Partial<Record<keyof CampaignUrlInput, string>>>(
    (fieldErrors, issue) => {
      const field = issue.path[0];

      if (typeof field === "string") {
        fieldErrors[field as keyof CampaignUrlInput] = issue.message;
      }

      return fieldErrors;
    },
    {}
  );
}
