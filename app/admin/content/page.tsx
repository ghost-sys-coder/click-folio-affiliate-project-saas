import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ContentStudioShell } from "@/components/admin/content-studio/content-studio-shell";
import {
  getActiveAffiliateLinksForContentStudio,
  getRecentGeneratedPostsForUser,
} from "@/db/generated-posts";
import { getUserByClerkUserId } from "@/db/profiles";

export const dynamic = "force-dynamic";

const ContentPage = async () => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/content");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    redirect("/onboarding");
  }

  const [links, recentGenerations] = await Promise.all([
    getActiveAffiliateLinksForContentStudio(user.id),
    getRecentGeneratedPostsForUser(user.id),
  ]);

  return (
    <ContentStudioShell
      links={links.map((link) => ({
        id: link.id,
        title: link.title,
        description: link.description,
        category: link.category,
        network: link.network,
      }))}
      recentGenerations={recentGenerations.map((item) => ({
        id: item.id,
        linkTitle: item.linkTitle,
        platform: item.platform,
        goal: item.goal,
        audience: item.audience,
        tone: item.tone,
        generatedText: item.generatedText,
        createdAt: item.createdAt.toISOString(),
      }))}
    />
  );
};

export default ContentPage;
