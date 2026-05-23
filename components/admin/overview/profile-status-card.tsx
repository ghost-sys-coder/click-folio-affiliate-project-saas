"use client";

import { CheckCircle2, Copy, Edit, ExternalLink, Globe, Layout, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileStatusCardProps = {
  isPublished: boolean;
  publicUrl: string;
  activeLinksCount: number;
  hasDisclosure: boolean;
  theme: string;
  removeBranding: boolean;
};

export function ProfileStatusCard({
  isPublished,
  publicUrl,
  activeLinksCount,
  hasDisclosure,
  theme,
  removeBranding,
}: ProfileStatusCardProps) {
  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public profile URL copied");
  };

  const themeLabel = theme === "signal-purple" ? "Signal Purple" : "Growth Mint";

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Public Profile</CardTitle>
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ? "Published" : "Hidden"}
          </Badge>
        </div>
        <CardDescription>Your audience-facing affiliate page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="size-4" />
              Public URL
            </div>
            <span className="font-mono text-[10px] truncate max-w-[150px]">{publicUrl}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="size-4" />
              Active Links
            </div>
            <span className="font-medium">{activeLinksCount}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4" />
              Disclosure
            </div>
            <Badge variant={hasDisclosure ? "outline" : "destructive"} className="h-5 text-[10px]">
              {hasDisclosure ? "Active" : "Missing"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layout className="size-4" />
              Theme
            </div>
            <span className="font-medium">{themeLabel}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="h-5 text-[10px]">Premium</Badge>
              Branding
            </div>
            <span className="text-xs">{removeBranding ? "Removed" : "Visible"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-border/40 bg-muted/10 pt-4">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={publicUrl} target="_blank">
            <ExternalLink className="mr-2 size-3" />
            View
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={copyPublicUrl}>
          <Copy className="mr-2 size-3" />
          Copy
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href="/admin/settings">
            <Edit className="mr-2 size-3" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
