import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPageGeneratorForm } from "@/components/admin/landing-page-generator-form";
import { getAffiliateLinksForWorkspace } from "@/db/affiliate-links";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export const metadata: Metadata = {
  title: "Landing Page Generator",
  description: "Create conversion-focused landing pages for your affiliate products using AI.",
};

export default async function GeneratorPage() {
  const planResult = await getCurrentUserPlan();

  if (!planResult.ok) {
    redirect("/admin");
  }

  const affiliateLinks = await getAffiliateLinksForWorkspace(planResult.plan.userId);

  return <LandingPageGeneratorForm affiliateLinks={affiliateLinks} />;
}
