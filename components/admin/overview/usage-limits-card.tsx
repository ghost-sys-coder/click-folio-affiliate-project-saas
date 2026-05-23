import { AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserPlan } from "@/lib/subscriptions";

type UsageLimitsCardProps = {
  userPlan: UserPlan;
  monthlyContentGenerations: number;
  totalAffiliateLinks: number;
  referenceDate?: Date;
};

export function UsageLimitsCard({
  userPlan,
  monthlyContentGenerations,
  totalAffiliateLinks,
  referenceDate = new Date(),
}: UsageLimitsCardProps) {
  const { limits, status, trialEndsAt } = userPlan;

  const contentGenPercent = Math.min(100, (monthlyContentGenerations / limits.maxContentGenerations) * 100);
  const linksPercent = limits.maxAffiliateLinks 
    ? Math.min(100, (totalAffiliateLinks / limits.maxAffiliateLinks) * 100)
    : 0;

  const isExpiringSoon = status === "trialing" && (trialEndsAt.getTime() - referenceDate.getTime()) < 2 * 24 * 60 * 60 * 1000;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Plan & Usage</CardTitle>
          <Zap className="size-4 text-primary" />
        </div>
        <CardDescription>Your current consumption and limits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">AI Content Generations</span>
            <span className="text-muted-foreground">
              {monthlyContentGenerations} / {limits.maxContentGenerations}
            </span>
          </div>
          <Progress value={contentGenPercent} className="h-1.5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Affiliate Links</span>
            <span className="text-muted-foreground">
              {totalAffiliateLinks} / {limits.maxAffiliateLinks || '∞'}
            </span>
          </div>
          <Progress value={linksPercent} className="h-1.5" />
        </div>

        <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Analytics Level</span>
            <span className="font-medium capitalize">{limits.analyticsLevel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Import Row Limit</span>
            <span className="font-medium">{limits.maxImportRowsPerUpload} rows</span>
          </div>
          {status === "trialing" && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trial Ends</span>
              <span className={`font-medium ${isExpiringSoon ? 'text-destructive' : ''}`}>
                {trialEndsAt.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {(status === "expired" || isExpiringSoon) && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex gap-2 items-start">
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive">
                {status === "expired" ? "Trial Expired" : "Trial Expiring Soon"}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Upgrade to a paid plan to keep your links active and maintain access to AI tools.
              </p>
              <Button asChild variant="link" className="h-auto p-0 text-[10px] text-destructive font-bold">
                <Link href="/admin/billing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
