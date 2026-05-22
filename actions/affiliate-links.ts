"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createAffiliateLinkForWorkspace,
  deleteAffiliateLinkForWorkspace,
  getAffiliateLinkWorkspaceByClerkUserId,
  setAffiliateLinkStatusForWorkspace,
  updateAffiliateLinkForWorkspace,
} from "@/db/affiliate-links";
import {
  affiliateLinkIdSchema,
  affiliateLinkStatuses,
  getAffiliateLinkValuesFromFormData,
  validateAffiliateLinkForm,
  type AffiliateLinkFormState,
} from "@/lib/affiliate-links";

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

  const workspace = await requireAffiliateLinkWorkspace();

  try {
    await createAffiliateLinkForWorkspace({
      userId: workspace.userId,
      profileId: workspace.profileId,
      data: validation.data,
    });
  } catch {
    return {
      message: "We could not create this affiliate link. Please try again.",
      values: validation.values,
    };
  }

  revalidatePath("/admin/links");
  redirect("/admin/links");
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
