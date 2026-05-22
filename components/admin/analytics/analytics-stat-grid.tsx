import { CalendarDays, CalendarRange, MousePointerClick, Timer } from "lucide-react";

import { AnalyticsStatCard } from "@/components/admin/analytics/analytics-stat-card";
import type { ClickSummary } from "@/db/analytics";

export function AnalyticsStatGrid({ summary }: { summary: ClickSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsStatCard
        label="Total clicks"
        value={summary.totalClicks.toLocaleString()}
        helper="All tracked public page clicks"
        icon={<MousePointerClick className="size-4" />}
      />
      <AnalyticsStatCard
        label="Today"
        value={summary.clicksToday.toLocaleString()}
        helper="Since 00:00 UTC"
        icon={<Timer className="size-4" />}
      />
      <AnalyticsStatCard
        label="This week"
        value={summary.clicksThisWeek.toLocaleString()}
        helper="Current calendar week"
        icon={<CalendarRange className="size-4" />}
      />
      <AnalyticsStatCard
        label="This month"
        value={summary.clicksThisMonth.toLocaleString()}
        helper="Current calendar month"
        icon={<CalendarDays className="size-4" />}
      />
    </div>
  );
}
