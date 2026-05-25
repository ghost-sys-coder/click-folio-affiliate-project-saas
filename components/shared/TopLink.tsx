import React from 'react';
import { ExternalLink } from 'lucide-react';

function TopLink({ title, clicks }: { title: string; clicks: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-accent">
          <ExternalLink className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">clickfolio.io/go/{title.split(" ")[0].toLowerCase() + ".com"}</p>
        </div>
      </div>
      <p className="text-sm font-semibold">{clicks}</p>
    </div>
  );
}

export default TopLink
