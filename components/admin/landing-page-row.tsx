"use client";

import { useTransition } from "react";
import Link from "next/link";
import { 
  Archive, 
  Copy, 
  Edit, 
  Eye, 
  MoreHorizontal, 
  Rocket,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableRow,
  TableCell
} from "@/components/ui/table";
import { 
  archiveLandingPageAction, 
  publishLandingPageAction, 
  unpublishLandingPageAction 
} from "@/actions/landing-pages";
import { getBaseUrl } from "@/lib/utils";

type LandingPageRowProps = {
  page: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "archived";
    theme: string;
    createdAt: Date;
    linkTitle: string;
    username: string;
  };
};

export function LandingPageRow({ page }: LandingPageRowProps) {
  const [isPending, startTransition] = useTransition();

  const copyPublicUrl = () => {
    const url = `${getBaseUrl()}/l/${page.username}/${page.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard");
  };

  const handleAction = (action: (id: string) => Promise<{ success: boolean; message?: string }>, successMsg: string) => {
    startTransition(async () => {
      const result = await action(page.id);
      if (result.success) {
        toast.success(successMsg);
      } else {
        toast.error((result as { message?: string }).message || "Action failed.");
      }
    });
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-100 text-green-700 border-green-200",
    archived: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <TableRow className="hover:bg-muted/10 transition-colors">
      <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{page.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {page.linkTitle}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`${statusColors[page.status]} text-[10px] font-bold h-5 uppercase tracking-wide px-1.5`}>
          {page.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-xs capitalize">{page.theme.replace("-", " ")}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(page.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
          ) : null}
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link href={`/admin/landing-pages/${page.id}/edit`}>
              <Edit className="size-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/landing-pages/${page.id}/preview`}>
                  <Eye className="mr-2 size-4" />
                  Preview
                </Link>
              </DropdownMenuItem>
              {page.status === "published" && (
                <DropdownMenuItem onClick={copyPublicUrl}>
                  <Copy className="mr-2 size-4" />
                  Copy Public URL
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {page.status !== "published" && (
                <DropdownMenuItem 
                  className="text-green-600 font-medium"
                  onClick={() => handleAction(publishLandingPageAction, "Page published.")}
                >
                  <Rocket className="mr-2 size-4" />
                  Publish Page
                </DropdownMenuItem>
              )}
              {page.status === "published" && (
                <DropdownMenuItem 
                  className="text-amber-600 font-medium"
                  onClick={() => handleAction(unpublishLandingPageAction, "Page unpublished.")}
                >
                  <Archive className="mr-2 size-4" />
                  Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleAction(archiveLandingPageAction, "Page archived.")}
              >
                <Archive className="mr-2 size-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
