import test from "node:test";
import assert from "node:assert/strict";

import { isCompleteOnboardingIntent } from "../lib/onboarding-submit.ts";

test("onboarding only completes with an explicit completion intent", () => {
  const continueFormData = new FormData();
  const completeFormData = new FormData();
  completeFormData.set("onboardingIntent", "complete");

  assert.equal(isCompleteOnboardingIntent(continueFormData), false);
  assert.equal(isCompleteOnboardingIntent(completeFormData), true);
});
