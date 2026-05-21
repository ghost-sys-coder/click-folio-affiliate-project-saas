import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

function TopLink({ title, clicks }: { title: string; clicks: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/0.04 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-200">
          <ExternalLink className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-white/45">clickfolio.io/go/example</p>
        </div>
      </div>
      <p className="text-sm font-semibold">{clicks}</p>
    </div>
  );
}

export default TopLink