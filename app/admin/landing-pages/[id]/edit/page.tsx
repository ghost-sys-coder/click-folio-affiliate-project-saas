import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LandingPageEditor } from "@/components/admin/landing-page-editor";
import { getLandingPageById } from "@/db/landing-pages";
import { getCurrentUserPlan } from "@/lib/subscriptions";

export const metadata: Metadata = {
  title: "Edit Landing Page",
};

export default async function EditLandingPagePage({
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

  return <LandingPageEditor landingPage={landingPage} />;
}
