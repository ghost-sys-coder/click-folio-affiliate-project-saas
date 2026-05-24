"use client";

import { Copy, ExternalLink, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type OverviewHeaderProps = {
  displayName: string;
  userEmail: string;
  publicUrl: string;
  planLabel: string;
};

export function OverviewHeader({
  displayName,
  userEmail,
  publicUrl,
  planLabel,
}: OverviewHeaderProps) {
  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public profile URL copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <span className="text-sm">{userEmail}</span>
          <span className="text-muted-foreground/40">•</span>
          <p className="text-sm">
            Current plan: <span className="font-medium text-foreground">{planLabel}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={publicUrl} target="_blank">
            <ExternalLink className="mr-2 size-4" />
            View Profile
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={copyPublicUrl}>
          <Copy className="mr-2 size-4" />
          Copy URL
        </Button>
        <Button asChild size="sm">
          <Link href="/admin/links/new">
            <Plus className="mr-2 size-4" />
            Add Link
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/campaigns">
            <Share2 className="mr-2 size-4" />
            Create Campaign
          </Link>
        </Button>
      </div>
    </div>
  );
}
