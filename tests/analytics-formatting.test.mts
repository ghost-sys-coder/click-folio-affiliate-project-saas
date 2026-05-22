import test from "node:test";
import assert from "node:assert/strict";

import {
  formatAnalyticsGroupLabel,
  getClickSummaryPeriodStarts,
} from "../lib/analytics-formatting.ts";

test("formats analytics group labels without exposing null values", () => {
  assert.equal(formatAnalyticsGroupLabel("source", null), "Direct or untagged");
  assert.equal(formatAnalyticsGroupLabel("medium", ""), "Unknown medium");
  assert.equal(
    formatAnalyticsGroupLabel("campaign", "   "),
    "Uncategorized campaign"
  );
  assert.equal(formatAnalyticsGroupLabel("country", null), "Unknown country");
  assert.equal(formatAnalyticsGroupLabel("device", null), "Unknown device");
  assert.equal(formatAnalyticsGroupLabel("source", " tiktok "), "tiktok");
});

test("builds click summary period starts from a reference date", () => {
  const starts = getClickSummaryPeriodStarts(
    new Date("2026-05-22T15:30:45.000Z")
  );

  assert.equal(starts.today.toISOString(), "2026-05-22T00:00:00.000Z");
  assert.equal(starts.week.toISOString(), "2026-05-17T00:00:00.000Z");
  assert.equal(starts.month.toISOString(), "2026-05-01T00:00:00.000Z");
});
