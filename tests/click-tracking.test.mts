import test from "node:test";
import assert from "node:assert/strict";

import {
  buildClickTrackingInput,
  buildTrackedGoHref,
  hashIpAddress,
  isTrackingPrefetchRequest,
  parseBrowser,
  parseDeviceType,
  parseOperatingSystem,
} from "../lib/click-tracking.ts";

test("parses basic device type from user agent", () => {
  assert.equal(
    parseDeviceType(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148"
    ),
    "mobile"
  );
  assert.equal(
    parseDeviceType(
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
    ),
    "tablet"
  );
  assert.equal(
    parseDeviceType(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36"
    ),
    "desktop"
  );
});

test("builds click tracking input from request metadata", async () => {
  const request = new Request(
    "https://clickfolio.test/go/link-id?utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_content=hero_button&utm_term=affiliate_tools",
    {
      headers: {
        referer: "https://creator.example/post",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/121.0.0.0 Mobile Safari/537.36",
        "x-forwarded-for": "203.0.113.10, 198.51.100.2",
        "x-vercel-ip-country": "UG",
      },
    }
  );

  const input = await buildClickTrackingInput(request, {
    affiliateLinkId: "link-id",
    profileId: "profile-id",
    userId: "user-id",
  });

  assert.equal(input.affiliateLinkId, "link-id");
  assert.equal(input.profileId, "profile-id");
  assert.equal(input.userId, "user-id");
  assert.equal(input.referer, "https://creator.example/post");
  assert.equal(
    input.userAgent,
    "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/121.0.0.0 Mobile Safari/537.36"
  );
  assert.equal(input.deviceType, "mobile");
  assert.equal(input.browser, "Chrome");
  assert.equal(input.os, "Android");
  assert.equal(input.country, "UG");
  assert.equal(input.source, "newsletter");
  assert.equal(input.medium, "email");
  assert.equal(input.campaign, "launch");
  assert.equal(input.content, "hero_button");
  assert.equal(input.term, "affiliate_tools");
  assert.equal(input.ipAddressHash, await hashIpAddress("203.0.113.10"));
  assert.ok(input.createdAt instanceof Date);
  assert.ok(input.updatedAt instanceof Date);
});

test("does not store an IP hash when no forwarding header is present", async () => {
  const request = new Request("https://clickfolio.test/go/link-id");

  const input = await buildClickTrackingInput(request, {
    affiliateLinkId: "link-id",
    profileId: "profile-id",
    userId: null,
  });

  assert.equal(input.ipAddressHash, null);
});

test("parses browser and operating system from user agent", () => {
  const safari =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";
  const edge =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0";

  assert.equal(parseBrowser(safari), "Safari");
  assert.equal(parseOperatingSystem(safari), "macOS");
  assert.equal(parseBrowser(edge), "Edge");
  assert.equal(parseOperatingSystem(edge), "Windows");
});

test("preserves public page UTM params in go link hrefs", () => {
  assert.equal(
    buildTrackedGoHref("link-id", {
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "spring launch",
      utm_content: "bio button",
      utm_term: "creator tools",
      ignored: "value",
    }),
    "/go/link-id?utm_source=instagram&utm_medium=social&utm_campaign=spring+launch&utm_content=bio+button&utm_term=creator+tools"
  );
});

test("keeps go link href clean when no UTM params exist", () => {
  assert.equal(buildTrackedGoHref("link-id", { ignored: "value" }), "/go/link-id");
});

test("detects prefetch requests that should not be tracked as clicks", () => {
  assert.equal(
    isTrackingPrefetchRequest(
      new Request("https://clickfolio.test/go/link-id", {
        headers: { "next-router-prefetch": "1" },
      })
    ),
    true
  );
  assert.equal(
    isTrackingPrefetchRequest(
      new Request("https://clickfolio.test/go/link-id", {
        headers: { purpose: "prefetch" },
      })
    ),
    true
  );
  assert.equal(
    isTrackingPrefetchRequest(
      new Request("https://clickfolio.test/go/link-id", {
        headers: { "sec-purpose": "prefetch" },
      })
    ),
    true
  );
  assert.equal(
    isTrackingPrefetchRequest(new Request("https://clickfolio.test/go/link-id")),
    false
  );
});
