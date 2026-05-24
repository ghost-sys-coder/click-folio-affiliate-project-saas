import { notFound, redirect } from "next/navigation";

import { LandingPageRenderer } from "@/components/landing-page/landing-page-renderer";
import { getLandingPageById } from "@/db/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";
import type { LandingPageOutput } from "@/lib/landing-pages";

export default async function PreviewLandingPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    redirect("/admin");
  }

  const landingPage = await getLandingPageById(id, planResult.plan.userId);

  if (!landingPage) {
    notFound();
  }

  return (
    <LandingPageRenderer
      data={landingPage.outputJson as LandingPageOutput}
      theme={landingPage.theme}
      affiliateLinkId={landingPage.affiliateLinkId}
      isPreview={true}
    />
  );
}
