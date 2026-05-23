import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ProfileEditor } from "@/components/admin/profile-editor";
import { getProfileByUserId, getUserByClerkUserId } from "@/db/profiles";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/settings");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user) {
    redirect("/onboarding");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ProfileEditor profile={profile} />
    </div>
  );
}
