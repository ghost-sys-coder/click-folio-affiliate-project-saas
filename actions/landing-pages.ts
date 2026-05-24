"use server";

import { revalidatePath } from "next/cache";
import { getLandingPageById, updateLandingPage } from "@/db/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import type { LandingPageOutput } from "@/lib/landing-pages";

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

  const parsePipeString = (val: string) => {
    return val.split("\n").filter(Boolean).map(line => {
      const [title, ...rest] = line.split("|");
      return {
        title: title.trim(),
        description: rest.join("|").trim(),
      };
    });
  };

  const parseFaqString = (val: string) => {
    return val.split("\n").filter(Boolean).map(line => {
      const [question, ...rest] = line.split("|");
      return {
        question: question.trim(),
        answer: rest.join("|").trim(),
      };
    });
  };

  // Manually update nested fields in outputJson
  const updatedOutput: LandingPageOutput = {
    ...output,
    hero: {
      ...output.hero,
      eyebrow: (formData.get("hero.eyebrow") as string) || undefined,
      headline: formData.get("hero.headline") as string,
      subheadline: formData.get("hero.subheadline") as string,
      ctaLabel: formData.get("hero.ctaLabel") as string,
    },
    problem: {
      ...output.problem,
      title: formData.get("problem.title") as string,
      body: formData.get("problem.body") as string,
      bullets: (formData.get("problem.bullets") as string).split("\n").filter(Boolean),
    },
    solution: {
      ...output.solution,
      title: formData.get("solution.title") as string,
      body: formData.get("solution.body") as string,
    },
    benefits: parsePipeString(formData.get("benefits") as string),
    useCases: parsePipeString(formData.get("useCases") as string),
    whoItIsFor: (formData.get("whoItIsFor") as string).split("\n").filter(Boolean),
    whoItIsNotFor: (formData.get("whoItIsNotFor") as string).split("\n").filter(Boolean),
    faq: parseFaqString(formData.get("faq") as string),
    finalCta: {
      ...output.finalCta,
      headline: formData.get("finalCta.headline") as string,
      body: formData.get("finalCta.body") as string,
      ctaLabel: formData.get("finalCta.ctaLabel") as string,
    },
    disclosure: formData.get("disclosure") as string,
    riskWarnings: (formData.get("riskWarnings") as string).split("\n").filter(Boolean),
  };

  try {
    await updateLandingPage(id, userId, {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      seoTitle: formData.get("seoTitle") as string,
      seoDescription: formData.get("seoDescription") as string,
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
