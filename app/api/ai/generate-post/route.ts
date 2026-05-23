import { NextResponse } from "next/server";

import {
  createGeneratedPostForUser,
  getContentStudioAffiliateLinkForUser,
} from "@/db/generated-posts";
import { getProfileByUserId } from "@/db/profiles";
import {
  contentStudioRequestSchema,
  generateContentStudioOutput,
  stringifyGeneratedContent,
} from "@/lib/content-studio";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import { canGenerateContent } from "@/lib/plans";
import { getMonthlyContentGenerationCount, recordUsageEvent } from "@/lib/usage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    return NextResponse.json(
      { error: planResult.error === "database-setup-required"
        ? "Database setup required. Contact support."
        : "An unexpected error occurred." },
      { status: 503 }
    );
  }

  const userPlan = planResult.plan;

  if (userPlan.status === "expired") {
    return NextResponse.json(
      { error: "Your trial has expired. Upgrade to continue generating content." },
      { status: 403 }
    );
  }

  const monthlyCount = await getMonthlyContentGenerationCount(userPlan.userId);

  if (!canGenerateContent(monthlyCount, userPlan.plan)) {
    return NextResponse.json(
      { error: `You have reached the monthly limit of ${userPlan.limits.maxContentGenerations} generations for your ${userPlan.limits.label} plan. Upgrade for more.` },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const validation = contentStudioRequestSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Invalid generation request.",
        issues: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const link = await getContentStudioAffiliateLinkForUser(
    userPlan.userId,
    validation.data.linkId
  );

  if (!link) {
    return NextResponse.json(
      { error: "Affiliate link not found." },
      { status: 404 }
    );
  }

  const profile = await getProfileByUserId(userPlan.userId);

  if (!profile) {
    return NextResponse.json(
      { error: "Complete onboarding before generating content." },
      { status: 409 }
    );
  }

  try {
    const result = await generateContentStudioOutput({
      request: validation.data,
      profile: {
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        niche: profile.niche,
        targetAudience: profile.targetAudience,
        contentTone: profile.contentTone,
        primaryGoal: profile.primaryGoal,
        disclosureText: profile.disclosureText,
      },
      link,
    });
    const generatedText = stringifyGeneratedContent(result.output);
    const savedPost = await createGeneratedPostForUser({
      userId: userPlan.userId,
      request: validation.data,
      outputJson: result.output,
      generatedText,
    });

    await recordUsageEvent(userPlan.userId, "content_generation", {
        provider: result.provider,
        linkId: validation.data.linkId
    });

    return NextResponse.json({
      id: savedPost.id,
      provider: result.provider,
      output: result.output,
      generatedText,
      createdAt: savedPost.createdAt,
    });
  } catch (error) {
    console.error("Content Studio generation failed", error);

    return NextResponse.json(
      { error: "Content generation failed. Please try again." },
      { status: 502 }
    );
  }
}
