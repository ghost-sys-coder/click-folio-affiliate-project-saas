export type AnalyticsGroupKind =
  | "source"
  | "medium"
  | "campaign"
  | "country"
  | "device";

const defaultLabels: Record<AnalyticsGroupKind, string> = {
  source: "Direct or untagged",
  medium: "Unknown medium",
  campaign: "Uncategorized campaign",
  country: "Unknown country",
  device: "Unknown device",
};

export function formatAnalyticsGroupLabel(
  kind: AnalyticsGroupKind,
  value: string | null
) {
  return value?.trim() || defaultLabels[kind];
}

export function getClickSummaryPeriodStarts(referenceDate = new Date()) {
  const today = startOfUtcDay(referenceDate);
  const week = startOfUtcDay(referenceDate);
  week.setUTCDate(week.getUTCDate() - week.getUTCDay());

  const month = startOfUtcDay(referenceDate);
  month.setUTCDate(1);

  return { today, week, month };
}

function startOfUtcDay(value: Date) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);

  return date;
}
