"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createAffiliateLinkForWorkspace,
  createBulkAffiliateLinksForWorkspace,
  deleteAffiliateLinkForWorkspace,
  getAffiliateLinkWorkspaceByClerkUserId,
  safeGetAffiliateLinksForWorkspace,
  setAffiliateLinkStatusForWorkspace,
  updateAffiliateLinkForWorkspace,
} from "@/db/affiliate-links";
import {
  affiliateLinkIdSchema,
  affiliateLinkStatuses,
  getAffiliateLinkValuesFromFormData,
  validateAffiliateLinkForm,
  validateBulkAffiliateLinks,
  type AffiliateLinkFormState,
  type AffiliateLinkValues,
} from "@/lib/affiliate-links";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { canCreateAffiliateLink, canImportRows } from "@/lib/plans";
import { recordUsageEvent } from "@/lib/usage";

const linkStatusUpdateSchema = affiliateLinkIdSchema.extend({
  status: z.enum(affiliateLinkStatuses),
});

export async function createAffiliateLink(
  state: AffiliateLinkFormState,
  formData: FormData
): Promise<AffiliateLinkFormState> {
  const validation = validateAffiliateLinkForm(formData);

  if (!validation.ok) {
    return {
      errors: validation.errors,
      values: validation.values,
    };
  }

  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return {
      message: planResult.error === "database-setup-required" 
        ? "Database setup required. Please contact support or run migrations."
        : "An unexpected error occurred. Please try again.",
      values: validation.values,
    };
  }

  const userPlan = planResult.plan;

  if (userPlan.status === "expired") {
    return {
      message: "Your trial has expired. Upgrade to continue creating links.",
      values: validation.values,
    };
  }

  const linksResult = await safeGetAffiliateLinksForWorkspace(userPlan.userId);
  const currentCount = linksResult.ok ? linksResult.links.length : 0;

  if (!canCreateAffiliateLink(currentCount, userPlan.plan)) {
    return {
      message: `You have reached the limit of ${userPlan.limits.maxAffiliateLinks} links for your ${userPlan.limits.label} plan. Upgrade for more.`,
      values: validation.values,
    };
  }

  const workspace = await requireAffiliateLinkWorkspace();

  try {
    await createAffiliateLinkForWorkspace({
      userId: workspace.userId,
      profileId: workspace.profileId,
      data: validation.data,
    });

    await recordUsageEvent(userPlan.userId, "affiliate_link_created");
  } catch {
    return {
      message: "We could not create this affiliate link. Please try again.",
      values: validation.values,
    };
  }

  revalidatePath("/admin/links");
  redirect("/admin/links");
}

export async function createBulkAffiliateLinks(links: AffiliateLinkValues[]) {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    throw new Error(planResult.error === "database-setup-required"
      ? "Database setup required. Run migrations to enable bulk imports."
      : "An unexpected error occurred. Please try again.");
  }

  const userPlan = planResult.plan;

  if (userPlan.status === "expired") {
    throw new Error("Your trial has expired. Upgrade to continue importing links.");
  }


  if (!canImportRows(links.length, userPlan.plan)) {
    throw new Error(`You can only import up to ${userPlan.limits.maxImportRowsPerUpload} links at once on the ${userPlan.limits.label} plan.`);
  }

  const linksResult = await safeGetAffiliateLinksForWorkspace(userPlan.userId);
  const currentCount = linksResult.ok ? linksResult.links.length : 0;

  if (userPlan.limits.maxAffiliateLinks !== null && currentCount + links.length > userPlan.limits.maxAffiliateLinks) {
    throw new Error(`This import would exceed your limit of ${userPlan.limits.maxAffiliateLinks} links. You currently have ${currentCount} links.`);
  }

  const workspace = await requireAffiliateLinkWorkspace();
  const validation = validateBulkAffiliateLinks(links);

  if (!validation.allValid) {
    throw new Error("Some links are invalid. Review the preview and try again.");
  }

  try {
    await createBulkAffiliateLinksForWorkspace({
      userId: workspace.userId,
      profileId: workspace.profileId,
      data: validation.validData,
    });

    await recordUsageEvent(userPlan.userId, "affiliate_link_imported", {
        source: "bulk",
        count: links.length
    });
  } catch {
    throw new Error("We could not create these affiliate links. Please try again.");
  }

  revalidatePath("/admin/links");
  redirect(`/admin/links?bulkImport=success&count=${links.length}`);
}

export async function updateAffiliateLink(
  id: string,
  state: AffiliateLinkFormState,
  formData: FormData
): Promise<AffiliateLinkFormState> {
  const idValidation = affiliateLinkIdSchema.safeParse({ id });
  const validation = validateAffiliateLinkForm(formData);

  if (!idValidation.success || !validation.ok) {
    return {
      errors: {
        ...(!idValidation.success ? { id: "Invalid link id." } : {}),
        ...(!validation.ok ? validation.errors : {}),
      },
      values: getAffiliateLinkValuesFromFormData(formData),
    };
  }

  const workspace = await requireAffiliateLinkWorkspace();

  try {
    const link = await updateAffiliateLinkForWorkspace({
      id: idValidation.data.id,
      userId: workspace.userId,
      profileId: workspace.profileId,
      data: validation.data,
    });

    if (!link) {
      return {
        message: "We could not find that affiliate link in your workspace.",
        values: validation.values,
      };
    }
  } catch {
    return {
      message: "We could not update this affiliate link. Please try again.",
      values: validation.values,
    };
  }

  revalidatePath("/admin/links");
  revalidatePath(`/admin/links/${idValidation.data.id}/edit`);
  redirect("/admin/links");
}

export async function toggleAffiliateLinkStatus(formData: FormData) {
  const validation = linkStatusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!validation.success) {
    redirect("/admin/links");
  }

  const workspace = await requireAffiliateLinkWorkspace();

  try {
    await setAffiliateLinkStatusForWorkspace({
      id: validation.data.id,
      userId: workspace.userId,
      status: validation.data.status,
    });
  } catch {
    redirect("/admin/links?mutation=failed");
  }

  revalidatePath("/admin/links");
}

export async function archiveAffiliateLink(formData: FormData) {
  const validation = affiliateLinkIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validation.success) {
    redirect("/admin/links");
  }

  const workspace = await requireAffiliateLinkWorkspace();

  try {
    await setAffiliateLinkStatusForWorkspace({
      id: validation.data.id,
      userId: workspace.userId,
      status: "archive",
    });
  } catch {
    redirect("/admin/links?mutation=failed");
  }

  revalidatePath("/admin/links");
}

export async function deleteAffiliateLink(formData: FormData) {
  const validation = affiliateLinkIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validation.success) {
    redirect("/admin/links");
  }

  const workspace = await requireAffiliateLinkWorkspace();
  let deletedLink: Awaited<ReturnType<typeof deleteAffiliateLinkForWorkspace>>;

  try {
    deletedLink = await deleteAffiliateLinkForWorkspace({
      id: validation.data.id,
      userId: workspace.userId,
    });
  } catch {
    redirect("/admin/links?linkDeleted=failed");
  }

  if (!deletedLink) {
    redirect("/admin/links?linkDeleted=failed");
  }

  revalidatePath("/admin/links");
  redirect("/admin/links?linkDeleted=success");
}

async function requireAffiliateLinkWorkspace() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/links");
  }

  const workspace = await getAffiliateLinkWorkspaceByClerkUserId(clerkUserId);

  if (!workspace) {
    redirect("/onboarding");
  }

  return workspace;
}
