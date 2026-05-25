import test from "node:test";
import assert from "node:assert/strict";

import {
  canApplyLandingPageAiEdit,
  canGenerateLandingPage,
  canPublishLandingPage,
} from "../utils/plans-helpers.ts";

test("allows landing page generation while plan quota remains", () => {
  assert.deepEqual(
    canGenerateLandingPage({
      plan: "starter",
      currentMonthlyGenerationCount: 4,
    }),
    {
      allowed: true,
      limit: 10,
      remaining: 6,
    }
  );
});

test("blocks landing page generation once the monthly quota is exhausted", () => {
  assert.deepEqual(
    canGenerateLandingPage({
      plan: "trial",
      currentMonthlyGenerationCount: 3,
    }),
    {
      allowed: false,
      limit: 3,
      remaining: 0,
    }
  );
});

test("tracks remaining landing page AI edits by plan", () => {
  assert.deepEqual(
    canApplyLandingPageAiEdit({
      plan: "pro",
      currentMonthlyAiEditCount: 98,
    }),
    {
      allowed: true,
      limit: 100,
      remaining: 2,
    }
  );
});

test("blocks new landing page publishes when the active published cap is reached", () => {
  assert.deepEqual(
    canPublishLandingPage({
      plan: "trial",
      currentPublishedLandingPagesCount: 3,
    }),
    {
      allowed: false,
      limit: 3,
      remaining: 0,
    }
  );
});
