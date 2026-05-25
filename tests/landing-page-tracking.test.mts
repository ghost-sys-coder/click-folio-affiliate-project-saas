import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLandingPageTrackingInput,
  buildTrackedGoHref,
} from "../lib/click-tracking.ts";

test("preserves landing page UTM params in tracked CTA hrefs", () => {
  assert.equal(
    buildTrackedGoHref("link-id", {
      utm_source: "youtube",
      utm_medium: "video",
      utm_campaign: "summer review",
      utm_content: "hero cta",
      utm_term: "creator stack",
    }),
    "/go/link-id?utm_source=youtube&utm_medium=video&utm_campaign=summer+review&utm_content=hero+cta&utm_term=creator+stack"
  );
});

test("builds landing page view tracking input from headers and query params", async () => {
  const input = await buildLandingPageTrackingInput(
    {
      headers: new Headers({
        referer: "https://creator.example/recommendations",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "x-forwarded-for": "203.0.113.40, 198.51.100.2",
        "x-vercel-ip-country": "UG",
      }),
      searchParams: {
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "launch",
        utm_content: "body_link",
        utm_term: "affiliate tools",
      },
    },
    {
      landingPageId: "landing-page-id",
      affiliateLinkId: "link-id",
      profileId: "profile-id",
      userId: "user-id",
    }
  );

  assert.equal(input.landingPageId, "landing-page-id");
  assert.equal(input.affiliateLinkId, "link-id");
  assert.equal(input.profileId, "profile-id");
  assert.equal(input.userId, "user-id");
  assert.equal(input.referer, "https://creator.example/recommendations");
  assert.equal(input.deviceType, "desktop");
  assert.equal(input.browser, "Chrome");
  assert.equal(input.os, "Windows");
  assert.equal(input.country, "UG");
  assert.equal(input.source, "newsletter");
  assert.equal(input.medium, "email");
  assert.equal(input.campaign, "launch");
  assert.equal(input.content, "body_link");
  assert.equal(input.term, "affiliate tools");
  assert.ok(typeof input.ipAddressHash === "string");
  assert.ok(input.createdAt instanceof Date);
  assert.ok(input.updatedAt instanceof Date);
});
