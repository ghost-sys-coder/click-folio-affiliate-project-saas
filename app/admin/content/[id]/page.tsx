import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { ContentGenerationDetail } from "@/components/admin/content-studio/content-generation-detail";
import { getGeneratedPostForUser } from "@/db/generated-posts";
import { getUserByClerkUserId } from "@/db/profiles";

export const dynamic = "force-dynamic";

export default async function ContentGenerationDetailPage(
  props: PageProps<"/admin/content/[id]">
) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/content");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user || user.isDeleted) {
    redirect("/onboarding");
  }

  const { id } = await props.params;
  const generation = await getGeneratedPostForUser(user.id, id);

  if (!generation) {
    notFound();
  }

  return <ContentGenerationDetail generation={generation} />;
}
