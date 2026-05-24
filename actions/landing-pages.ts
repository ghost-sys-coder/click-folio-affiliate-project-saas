"use server";

import { revalidatePath } from "next/cache";
import { getLandingPageById, updateLandingPage } from "@/db/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import type { LandingPageOutput, LandingPageSection } from "@/lib/landing-pages";

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

  const output = existing.outputJson as LandingPageOutput;
  const legacyData = output as any;

  // Ensure we have sections (backward compatibility)
  const currentSections = output.sections || [
    { type: "hero", content: legacyData.hero },
    { type: "problem", content: legacyData.problem },
    { type: "solution", content: legacyData.solution },
    { type: "benefits", content: { title: "Why Choose This?", items: legacyData.benefits } },
    { type: "productHighlights", content: { title: "Key Features", items: legacyData.productHighlights } },
    { type: "audience", content: { 
        perfectForTitle: "Perfect For", 
        perfectForItems: legacyData.whoItIsFor,
        notForTitle: "Not For You If",
        notForItems: legacyData.whoItIsNotFor
    } },
    { type: "useCases", content: { title: "Real World Applications", items: legacyData.useCases } },
    { type: "faq", content: { title: "Common Questions", items: legacyData.faq } },
    { type: "finalCta", content: legacyData.finalCta },
  ].filter(s => s.content);

  // Generic helper to update nested objects in sections
  const updatedSections = currentSections.map((section, index) => {
    const sectionPrefix = `section.${index}.`;
    const newContent = { ...section.content } as any;

    // Iterate through all keys in the current section's content
    Object.keys(newContent).forEach(key => {
      const formValue = formData.get(`${sectionPrefix}${key}`);
      
      if (formValue !== null) {
        // Handle special cases (arrays, booleans)
        if (key === "bullets" || key === "perfectForItems" || key === "notForItems") {
          newContent[key] = (formValue as string).split("\n").filter(Boolean);
        } else if (key === "items" || key === "rows" || key === "steps") {
          // These complex nested structures are harder to parse from flat FormData
          // preserved as is for now
        } else if (typeof newContent[key] === "boolean") {
          newContent[key] = formValue === "true";
        } else {
          newContent[key] = formValue as string;
        }
      }
    });

    return {
      ...section,
      content: newContent,
    };
  }) as LandingPageSection[];

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
    await updateLandingPage(id, planResult.plan.userId, {
      status: "published",
      publishedAt: new Date(),
    });
    revalidatePath("/admin/landing-pages");
    return { success: true, message: "Page published." };
  } catch (_error) {
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
  } catch (_error) {
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
  } catch (_error) {
    return { success: false, message: "Archiving failed." };
  }
}
