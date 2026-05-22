import { MousePointerClick } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function AnalyticsEmptyState() {
  return (
    <Empty className="min-h-56 border border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MousePointerClick className="size-4" />
        </EmptyMedia>
        <EmptyTitle>No click data yet</EmptyTitle>
        <EmptyDescription>
          Share your public profile or a campaign URL. Click performance will
          appear here after visitors open your affiliate links.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
