import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCampaignUrl,
  campaignUrlInputSchema,
} from "../lib/campaign-url.ts";

test("builds a campaign URL with required and optional UTM parameters", () => {
  const input = campaignUrlInputSchema.parse({
    source: "tiktok",
    medium: "short_video",
    campaign: "black friday",
    content: "bio button",
    term: "creator tools",
  });

  assert.equal(
    buildCampaignUrl("https://clickfolio.test/u/ghostman", input),
    "https://clickfolio.test/u/ghostman?utm_source=tiktok&utm_medium=short_video&utm_campaign=black+friday&utm_content=bio+button&utm_term=creator+tools"
  );
});

test("builds a campaign URL without optional empty UTM parameters", () => {
  const input = campaignUrlInputSchema.parse({
    source: "instagram",
    medium: "social",
    campaign: "launch",
    content: "",
    term: "",
  });

  assert.equal(
    buildCampaignUrl("/u/ghostman", input),
    "/u/ghostman?utm_source=instagram&utm_medium=social&utm_campaign=launch"
  );
});

test("rejects missing required campaign URL fields", () => {
  const result = campaignUrlInputSchema.safeParse({
    source: "",
    medium: "social",
    campaign: "",
  });

  assert.equal(result.success, false);
});
