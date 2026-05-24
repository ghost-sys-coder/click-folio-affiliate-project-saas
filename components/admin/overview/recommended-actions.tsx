"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, Lightbulb, Link2, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserPlan } from "@/lib/subscriptions";

type RecommendedActionsProps = {
  activeLinksCount: number;
  totalClicks: number;
  hasUtmData: boolean;
  contentGenerationsUsed: number;
  hasDisclosure: boolean;
  userPlan: UserPlan;
  publicUrl: string;
  referenceDate?: Date;
};

type Action = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  label: string;
};

export function RecommendedActions({
  activeLinksCount,
  totalClicks,
  hasUtmData,
  contentGenerationsUsed,
  hasDisclosure,
  userPlan,
  publicUrl,
  referenceDate = new Date(),
}: RecommendedActionsProps) {
  const actions: Action[] = [];

  const copyPublicUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public profile URL copied to clipboard");
  };

  if (activeLinksCount < 3) {
    actions.push({
      title: "Add more links",
      description: "You only have a few active links. Profiles with 5+ links see 40% more engagement.",
      icon: Link2,
      href: "/admin/links/new",
      label: "Add Link",
    });
  }

  if (totalClicks === 0) {
    actions.push({
      title: "Share your profile",
      description: "No clicks yet! Share your public profile URL on your social media bios to start tracking.",
      icon: Megaphone,
      href: "/admin",
      label: "Copy URL",
    });
  } else if (!hasUtmData) {
    actions.push({
      title: "Track your traffic",
      description: "Most of your clicks are untagged. Use the Campaign Builder to see which platforms perform best.",
      icon: ArrowRight,
      href: "/admin/campaigns",
      label: "Build URL",
    });
  }

  if (contentGenerationsUsed === 0) {
    actions.push({
      title: "Generate promotion content",
      description: "Use our AI Content Studio to create high-converting copy for your top affiliate offers.",
      icon: Sparkles,
      href: "/admin/content",
      label: "Try AI Studio",
    });
  }

  if (!hasDisclosure) {
    actions.push({
      title: "Update disclosure",
      description: "Your profile is missing a custom affiliate disclosure. Stay compliant and build trust.",
      icon: ShieldCheck,
      href: "/admin/settings",
      label: "Edit Profile",
    });
  }

  const { status, trialEndsAt } = userPlan;
  const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (status === "trialing" && daysRemaining <= 2) {
    actions.push({
      title: "Secure your workspace",
      description: `Your trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Upgrade now to avoid service interruption.`,
      icon: Lightbulb,
      href: "/admin/billing",
      label: "View Plans",
    });
  }

  if (actions.length === 0) {
      return null;
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" />
          <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
        </div>
        <CardDescription>Actions to optimize your affiliate performance.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.slice(0, 4).map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.title} className="group relative flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-4" />
                  </div>
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
                <Button asChild variant="link" className="h-auto p-0 text-xs justify-start font-bold">
                  <Link 
                    href={action.href === "/admin" ? "#" : action.href} 
                    onClick={action.href === "/admin" ? copyPublicUrl : undefined}
                  >
                    {action.label}
                    <ArrowRight className="ml-1 size-3" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

