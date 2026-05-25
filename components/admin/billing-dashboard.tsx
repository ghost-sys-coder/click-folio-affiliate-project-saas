import { Check, Info, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { plans, type PlanKey } from "@/lib/plans";
import type { UserPlan } from "@/lib/subscriptions";
import type { UsageSummary } from "@/lib/usage";

type BillingDashboardProps = {
  userPlan: UserPlan;
  usage: UsageSummary;
};

export function BillingDashboard({ userPlan, usage }: BillingDashboardProps) {
  const currentPlanLimits = userPlan.limits;

  const contentGenPercent = Math.min(
    100,
    (usage.monthlyContentGenerations / currentPlanLimits.maxContentGenerations) * 100
  );
  const linksPercent = currentPlanLimits.maxAffiliateLinks
    ? Math.min(100, (usage.totalAffiliateLinks / currentPlanLimits.maxAffiliateLinks) * 100)
    : 0;
  const landingPageGenerationsPercent = Math.min(
    100,
    (usage.monthlyLandingPageGenerations / currentPlanLimits.maxLandingPageGenerations) * 100
  );
  const landingPageAiEditsPercent = Math.min(
    100,
    (usage.monthlyLandingPageAiEdits / currentPlanLimits.maxLandingPageAIEdits) * 100
  );
  const publishedLandingPagesPercent = Math.min(
    100,
    (usage.publishedLandingPages / currentPlanLimits.maxPublishedLandingPages) * 100
  );

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and upgrade your plan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {userPlan.status === "trialing" ? "TRIALING" : userPlan.status.toUpperCase()}
              </Badge>
              {userPlan.status === "trialing" && (
                <span className="text-xs font-medium text-muted-foreground">
                  Ends on {new Date(userPlan.trialEndsAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <CardTitle className="text-2xl mt-2">{currentPlanLimits.label}</CardTitle>
            <CardDescription>Your current active subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm font-medium">Included Features:</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.maxAffiliateLinks ?? "Unlimited"} Affiliate Links
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.maxContentGenerations} AI Content Generations / mo
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.maxLandingPageGenerations} Landing Page Generations / mo
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.maxLandingPageAIEdits} Landing Page AI Edits / mo
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.maxPublishedLandingPages} Published Landing Pages
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.analyticsLevel.charAt(0).toUpperCase() + currentPlanLimits.analyticsLevel.slice(1)} Analytics
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {currentPlanLimits.clickHistoryDays === "unlimited" ? "Unlimited" : currentPlanLimits.clickHistoryDays} days click history
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Usage This Month</CardTitle>
            <CardDescription>Your current consumption against plan limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <UsageRow
              label="AI Content Generations"
              value={usage.monthlyContentGenerations}
              limit={currentPlanLimits.maxContentGenerations}
              progress={contentGenPercent}
            />

            <UsageRow
              label="Affiliate Links"
              value={usage.totalAffiliateLinks}
              limit={currentPlanLimits.maxAffiliateLinks ?? "Unlimited"}
              progress={linksPercent}
            />

            <UsageRow
              label="Landing Page Generations"
              value={usage.monthlyLandingPageGenerations}
              limit={currentPlanLimits.maxLandingPageGenerations}
              progress={landingPageGenerationsPercent}
            />

            <UsageRow
              label="Landing Page AI Edits"
              value={usage.monthlyLandingPageAiEdits}
              limit={currentPlanLimits.maxLandingPageAIEdits}
              progress={landingPageAiEditsPercent}
            />

            <UsageRow
              label="Published Landing Pages"
              value={usage.publishedLandingPages}
              limit={currentPlanLimits.maxPublishedLandingPages}
              progress={publishedLandingPagesPercent}
            />

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="size-4 shrink-0 mt-0.5" />
              AI content generations, landing page generations, and landing page AI edits reset each calendar month. Published landing pages reflect your current live pages.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Choose the right plan for you</h2>
          <p className="text-muted-foreground">All plans include our core affiliate tracking and public profile features.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(plans) as PlanKey[]).map((key) => {
            const plan = plans[key];
            const isCurrent = userPlan.plan === key;

            return (
              <Card key={key} className={`flex flex-col relative ${isCurrent ? "border-primary ring-1 ring-primary/20" : ""}`}>
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.label}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold">${plan.priceMonthly || 0}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>{plan.maxAffiliateLinks ?? "Unlimited"} Links</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>{plan.maxContentGenerations} AI Generations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>{plan.maxLandingPageGenerations} Landing Pages / mo</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>{plan.analyticsLevel} Analytics</span>
                    </li>
                    {plan.removeBranding && (
                      <li className="flex items-center gap-2 font-medium text-foreground">
                        <Sparkles className="size-4 text-amber-500 shrink-0" />
                        <span>No Branding</span>
                      </li>
                    )}
                    {plan.customThemes && (
                      <li className="flex items-center gap-2 font-medium text-foreground">
                        <Zap className="size-4 text-indigo-500 shrink-0" />
                        <span>Custom Themes</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Active" : "Payments coming soon"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UsageRow({
  label,
  value,
  limit,
  progress,
}: {
  label: string;
  value: number;
  limit: number | string;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} / {limit}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
