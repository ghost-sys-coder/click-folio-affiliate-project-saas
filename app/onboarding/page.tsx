import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BadgeCheck, LineChart, Link2, ShieldCheck } from "lucide-react";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOnboardingStateByClerkUserId } from "@/db/profiles";
import { appThemes } from "@/lib/themes";
import { getDefaultOnboardingValues } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  const onboardingState = await getOnboardingStateByClerkUserId(userId);

  if (onboardingState.profileId) {
    redirect("/admin");
  }

  const clerkUser = await currentUser();
  const displayName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    "";
  const usernameSeed =
    clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress.split("@")[0] || "";

  return (
    <main
      data-theme={appThemes.growthMint}
      className="min-h-svh bg-background text-foreground"
    >
      <div className="mx-auto grid min-h-svh w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:py-12">
        <section className="flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Required before dashboard access
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
                Set the foundation for your affiliate business.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Clickfolio uses your profile to power your public page, link
                organization, disclosures, analytics context, and future content
                generation.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                icon: Link2,
                title: "Public link hub",
                text: "Reserve your handle and launch with a clean profile shell.",
              },
              {
                icon: LineChart,
                title: "Tracking-ready workspace",
                text: "Every affiliate link and campaign will attach to this profile.",
              },
              {
                icon: BadgeCheck,
                title: "Disclosure-first publishing",
                text: "Start with transparent affiliate language from day one.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} size="sm" className="bg-surface">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-surface-soft text-primary">
                        <Icon className="size-4" />
                      </span>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.text}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="self-center">
          <OnboardingForm
            initialValues={getDefaultOnboardingValues(displayName, usernameSeed)}
          />
        </section>
      </div>
    </main>
  );
}
