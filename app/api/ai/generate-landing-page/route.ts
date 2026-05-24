import { NextResponse } from "next/server";

import { getAffiliateLinkForWorkspace } from "@/db/affiliate-links";
import { createLandingPageDraft } from "@/db/landing-pages";
import { getProfileByUserId } from "@/db/profiles";
import { generateLandingPageContent } from "@/lib/ai-landing-pages";
import { landingPageGenerationSchema } from "@/lib/landing-pages";
import { canGenerateContent } from "@/lib/plans";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { getMonthlyContentGenerationCount, recordUsageEvent } from "@/lib/usage";
import { slugify } from "@/lib/utils";

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

  const monthlyCount = await getMonthlyContentGenerationCount(userPlan.userId);

  if (!canGenerateContent(monthlyCount, userPlan.plan)) {
    return NextResponse.json(
      { error: "Monthly generation limit reached." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const validation = landingPageGenerationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const link = await getAffiliateLinkForWorkspace(
    userPlan.userId,
    validation.data.linkId
  );

  if (!link) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  const profile = await getProfileByUserId(userPlan.userId);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  try {
    const result = await generateLandingPageContent({
      request: validation.data,
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

    // Create a base slug from the title
    const baseSlug = slugify(result.output.hero.headline.slice(0, 50));
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const savedDraft = await createLandingPageDraft({
      userId: userPlan.userId,
      profileId: profile.id,
      affiliateLinkId: link.id,
      slug: uniqueSlug,
      title: result.output.hero.headline,
      theme: validation.data.theme,
      inputJson: validation.data,
      outputJson: {
        ...result.output,
        hero: {
          ...result.output.hero,
          imageUrl: validation.data.imageUrl || undefined,
          videoUrl: validation.data.videoUrl || undefined,
        },
      },
      seoTitle: result.output.seo.title,
      seoDescription: result.output.seo.description,
    });

    await recordUsageEvent(userPlan.userId, "landing_page_generated", {
      provider: result.provider,
      linkId: link.id,
      landingPageId: savedDraft.id,
    });

    return NextResponse.json(savedDraft);
  } catch (error) {
    console.error("Landing page generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate landing page." },
      { status: 500 }
    );
  }
}
