import { Link2 } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ContentStudioEmptyState() {
  return (
    <Empty className="min-h-96 border border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Link2 className="size-4" />
        </EmptyMedia>
        <EmptyTitle>No active affiliate links</EmptyTitle>
        <EmptyDescription>
          Create or activate an affiliate link before generating promotional
          content.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
