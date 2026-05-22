import test from "node:test";
import assert from "node:assert/strict";

import {
  buildClickTrackingInput,
  hashIpAddress,
  parseDeviceType,
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
    "https://clickfolio.test/go/link-id?utm_source=newsletter&utm_medium=email&utm_campaign=launch",
    {
      headers: {
        referer: "https://creator.example/post",
        "user-agent": "Mozilla/5.0 (Android 14; Mobile) AppleWebKit/537.36",
        "x-forwarded-for": "203.0.113.10, 198.51.100.2",
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
  assert.equal(input.userAgent, "Mozilla/5.0 (Android 14; Mobile) AppleWebKit/537.36");
  assert.equal(input.deviceType, "mobile");
  assert.equal(input.source, "newsletter");
  assert.equal(input.medium, "email");
  assert.equal(input.campaign, "launch");
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
