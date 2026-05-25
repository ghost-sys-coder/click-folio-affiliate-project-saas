import { NextResponse } from "next/server";

import { getAffiliateLinkForWorkspace } from "@/db/affiliate-links";
import { getLandingPageById, updateLandingPage } from "@/db/landing-pages";
import { getProfileByUserId } from "@/db/profiles";
import { editLandingPageContent } from "@/lib/ai-landing-pages";
import {
  landingPageEditSchema,
  normalizeLandingPageOutput,
} from "@/lib/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return NextResponse.json(
      { error: "Plan validation failed." },
      { status: 503 }
    );
  }

  const userPlan = planResult.plan;

  if (userPlan.status === "expired") {
    return NextResponse.json(
      { error: "Your trial has expired. Upgrade to continue." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const validation = landingPageEditSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Invalid edit request.",
        issues: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const landingPage = await getLandingPageById(
    validation.data.landingPageId,
    userPlan.userId
  );

  if (!landingPage) {
    return NextResponse.json(
      { error: "Landing page not found." },
      { status: 404 }
    );
  }

  const [profile, link] = await Promise.all([
    getProfileByUserId(userPlan.userId),
    getAffiliateLinkForWorkspace(userPlan.userId, landingPage.affiliateLinkId),
  ]);

  if (!profile || !link) {
    return NextResponse.json(
      { error: "Unable to resolve the landing page context." },
      { status: 409 }
    );
  }

  try {
    const currentOutput = normalizeLandingPageOutput(landingPage.outputJson);
    const result = await editLandingPageContent({
      instructions: validation.data.instructions,
      currentOutput,
      profile: {
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        targetAudience: profile.targetAudience,
        disclosureText: profile.disclosureText,
      },
      link: {
        title: link.title,
        description: link.description,
        destinationUrl: link.destinationUrl,
      },
    });

    const nextHeroSection = result.output.sections.find(
      (section) => section.type === "hero"
    );
    const nextTitle =
      nextHeroSection?.type === "hero"
        ? nextHeroSection.content.headline
        : landingPage.title;

    const updatedLandingPage = await updateLandingPage(
      landingPage.id,
      userPlan.userId,
      {
        title: nextTitle,
        outputJson: result.output,
        seoTitle: result.output.seo.title,
        seoDescription: result.output.seo.description,
      }
    );

    return NextResponse.json({
      id: updatedLandingPage?.id ?? landingPage.id,
      title: updatedLandingPage?.title ?? nextTitle,
      output: result.output,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Landing page AI edit failed", error);

    return NextResponse.json(
      { error: "Failed to edit landing page." },
      { status: 500 }
    );
  }
}
