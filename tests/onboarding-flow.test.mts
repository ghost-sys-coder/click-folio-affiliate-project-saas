import test from "node:test";
import assert from "node:assert/strict";

import {
  canSubmitOnboardingStep,
  onboardingSteps,
} from "../lib/onboarding-flow.ts";

test("only the final onboarding step can submit the profile", () => {
  const publishingStepIndex = onboardingSteps.length - 1;

  assert.equal(canSubmitOnboardingStep(0), false);
  assert.equal(canSubmitOnboardingStep(publishingStepIndex - 1), false);
  assert.equal(canSubmitOnboardingStep(publishingStepIndex), true);
});
