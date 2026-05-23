import {
  Link2,
  MousePointer2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OverviewKPIGridProps = {
  totalClicks: number;
  clicksToday: number;
  activeLinks: number;
  contentGenerations: number;
};

export function OverviewKPIGrid({
  totalClicks,
  clicksToday,
  activeLinks,
  contentGenerations,
}: OverviewKPIGridProps) {
  const kpis = [
    {
      title: "Total Clicks",
      value: totalClicks.toLocaleString(),
      description: "All-time redirects tracked",
      icon: MousePointer2,
      color: "text-blue-500",
    },
    {
      title: "Clicks Today",
      value: clicksToday.toLocaleString(),
      description: "Redirects in last 24h",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Active Links",
      value: activeLinks.toLocaleString(),
      description: "Currently published offers",
      icon: Link2,
      color: "text-purple-500",
    },
    {
      title: "AI Generations",
      value: contentGenerations.toLocaleString(),
      description: "Used this calendar month",
      icon: Sparkles,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {kpi.title}
              </CardTitle>
              <Icon className={`size-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
