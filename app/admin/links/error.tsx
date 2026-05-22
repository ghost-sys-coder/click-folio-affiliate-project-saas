"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function AdminLinksError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="mx-auto min-h-96 max-w-3xl border border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle className="size-4" />
        </EmptyMedia>
        <EmptyTitle>Workspace interrupted</EmptyTitle>
        <EmptyDescription>
          Something interrupted this view. Retry the request or return to the
          links dashboard.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={reset}>
          <RefreshCcw className="size-4" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
