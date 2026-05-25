"use server";

import { revalidatePath } from "next/cache";
import {
  getLandingPageById,
  getPublishedLandingPagesCount,
  updateLandingPage,
} from "@/db/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import {
  hydrateLandingPageSectionsFromForm,
  normalizeLandingPageOutput,
  type LandingPageOutput,
} from "@/lib/landing-pages";
import { canPublishLandingPage } from "@/utils/plans-helpers";

export type LandingPageUpdateState = {
  success: boolean;
  message: string;
};

export async function updateLandingPageAction(prevState: LandingPageUpdateState, formData: FormData): Promise<LandingPageUpdateState> {
  const planResult = await getCurrentUserPlan();
  if (!planResult.ok) return { success: false, message: "Unauthorized." };

  const userId = planResult.plan.userId;
  const id = formData.get("id") as string;
  if (!id) return { success: false, message: "Missing ID." };

  const existing = await getLandingPageById(id, userId);
  if (!existing) return { success: false, message: "Landing page not found." };

  const output = normalizeLandingPageOutput(existing.outputJson);
  const updatedSections = hydrateLandingPageSectionsFromForm({
    existingSections: output.sections,
    formData,
  });

  const updatedOutput: LandingPageOutput = {
    ...output,
    sections: updatedSections,
    disclosure: formData.get("disclosure") as string || output.disclosure,
    riskWarnings: (formData.get("riskWarnings") as string || "").split("\n").filter(Boolean),
    seo: {
      title: formData.get("seoTitle") as string || output.seo.title,
      description: formData.get("seoDescription") as string || output.seo.description,
    }
  };

  try {
    await updateLandingPage(id, userId, {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      seoTitle: updatedOutput.seo.title,
      seoDescription: updatedOutput.seo.description,
      outputJson: updatedOutput,
    });

    revalidatePath("/admin/landing-pages");
    revalidatePath(`/admin/landing-pages/${id}/edit`);
    return { success: true, message: "Changes saved." };
  } catch (error) {
    console.error("Failed to update landing page", error);
    return { success: false, message: "Failed to save changes." };
  }
}

export async function publishLandingPageAction(id: string) {
  const planResult = await getCurrentUserPlan();
  if (!planResult.ok) return { success: false, message: "Unauthorized." };

  try {
    const currentPublishedLandingPagesCount = await getPublishedLandingPagesCount(
      planResult.plan.userId
    );
    const publishAccess = canPublishLandingPage({
      plan: planResult.plan.plan,
      currentPublishedLandingPagesCount,
    });

    if (!publishAccess.allowed) {
      return {
        success: false,
        message: `Published landing page limit reached (${publishAccess.limit} on ${planResult.plan.limits.label}).`,
      };
    }

    await updateLandingPage(id, planResult.plan.userId, {
      status: "published",
      publishedAt: new Date(),
    });
    revalidatePath("/admin/landing-pages");
    return { success: true, message: "Page published." };
  } catch {
    return { success: false, message: "Publishing failed." };
  }
}

export async function unpublishLandingPageAction(id: string) {
  const planResult = await getCurrentUserPlan();
  if (!planResult.ok) return { success: false, message: "Unauthorized." };

  try {
    await updateLandingPage(id, planResult.plan.userId, {
      status: "draft",
    });
    revalidatePath("/admin/landing-pages");
    return { success: true, message: "Page unpublished." };
  } catch {
    return { success: false, message: "Operation failed." };
  }
}

export async function archiveLandingPageAction(id: string) {
  const planResult = await getCurrentUserPlan();
  if (!planResult.ok) return { success: false, message: "Unauthorized." };

  try {
    await updateLandingPage(id, planResult.plan.userId, {
      status: "archived",
    });
    revalidatePath("/admin/landing-pages");
    return { success: true, message: "Page archived." };
  } catch {
    return { success: false, message: "Archiving failed." };
  }
}
