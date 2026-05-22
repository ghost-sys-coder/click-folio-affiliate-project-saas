import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  createGeneratedPostForUser,
  getContentStudioAffiliateLinkForUser,
} from "@/db/generated-posts";
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";
import {
  contentStudioRequestSchema,
  generateContentStudioOutput,
  stringifyGeneratedContent,
} from "@/lib/content-studio";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    return NextResponse.json({ error: "Workspace unavailable." }, { status: 403 });
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
    user.id,
    validation.data.linkId
  );

  if (!link) {
    return NextResponse.json(
      { error: "Affiliate link not found." },
      { status: 404 }
    );
  }

  const profile = await getProfileByUserId(user.id);

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
      userId: user.id,
      request: validation.data,
      outputJson: result.output,
      generatedText,
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
