"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { LandingPageRow } from "./landing-page-row";

type LandingPageListItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  theme: string;
  createdAt: Date;
  linkTitle: string;
  username: string;
};

type LandingPagesListProps = {
  landingPages: LandingPageListItem[];
};

export function LandingPagesList({ landingPages }: LandingPagesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landing Pages</h1>
          <p className="text-muted-foreground">
            Manage your generated affiliate landing pages.
          </p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/20">
          <Link href="/admin/generator">
            <Plus className="mr-2 size-4" />
            New Landing Page
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Title & Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landingPages.length > 0 ? (
              landingPages.map((page) => (
                <LandingPageRow key={page.id} page={page} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No landing pages generated yet. Start by generating one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
