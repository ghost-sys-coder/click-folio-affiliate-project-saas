import test from "node:test";
import assert from "node:assert/strict";

import {
  defaultDisclosure,
  getDefaultOnboardingValues,
  validateOnboardingForm,
} from "../lib/onboarding.ts";

function buildFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

test("default onboarding values include expanded profile fields and Clerk avatar", () => {
  const values = getDefaultOnboardingValues(
    "Ada Lovelace",
    "ada@example.com",
    "https://img.clerk.com/avatar.png"
  );

  assert.equal(values.username, "ada-example-com");
  assert.equal(values.displayName, "Ada Lovelace");
  assert.equal(values.avatarUrl, "https://img.clerk.com/avatar.png");
  assert.equal(values.coverImageUrl, "");
  assert.equal(values.targetAudience, "Affiliate marketers");
  assert.equal(values.primaryPlatform, "instagram");
  assert.equal(values.contentTone, "direct");
  assert.equal(values.primaryGoal, "organize-links");
  assert.equal(values.defaultButtonLabel, "View Deal");
  assert.equal(values.disclosureText, defaultDisclosure);
});

test("validateOnboardingForm accepts complete expanded onboarding data", () => {
  const result = validateOnboardingForm(
    buildFormData({
      username: "premium_creator",
      displayName: "Premium Creator",
      niche: "creator-tools",
      theme: "signal-purple",
      bio: "Curated tools for operators building calmer revenue systems.",
      disclosureText:
        "Some links may earn a commission at no extra cost to you.",
      avatarUrl: "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
      targetAudience: "SaaS founders",
      primaryPlatform: "youtube",
      contentTone: "expert",
      primaryGoal: "grow-revenue",
      defaultButtonLabel: "See Offer",
    })
  );

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.avatarUrl, "https://res.cloudinary.com/demo/image/upload/avatar.jpg");
    assert.equal(result.data.coverImageUrl, "https://res.cloudinary.com/demo/image/upload/cover.jpg");
    assert.equal(result.data.targetAudience, "SaaS founders");
    assert.equal(result.data.primaryPlatform, "youtube");
    assert.equal(result.data.contentTone, "expert");
    assert.equal(result.data.primaryGoal, "grow-revenue");
    assert.equal(result.data.defaultButtonLabel, "See Offer");
  }
});

test("validateOnboardingForm rejects invalid media urls and strategy options", () => {
  const result = validateOnboardingForm(
    buildFormData({
      username: "pc",
      displayName: "P",
      niche: "unknown",
      theme: "growth-mint",
      bio: "",
      disclosureText: "",
      avatarUrl: "javascript:alert(1)",
      coverImageUrl: "ftp://example.com/cover.jpg",
      targetAudience: "",
      primaryPlatform: "myspace",
      contentTone: "loud",
      primaryGoal: "something-else",
      defaultButtonLabel: "x".repeat(33),
    })
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.match(result.errors.username ?? "", /3-30/);
    assert.match(result.errors.displayName ?? "", /between 2 and 80/);
    assert.match(result.errors.niche ?? "", /niche/);
    assert.match(result.errors.avatarUrl ?? "", /valid image URL/);
    assert.match(result.errors.coverImageUrl ?? "", /valid image URL/);
    assert.match(result.errors.targetAudience ?? "", /audience/);
    assert.match(result.errors.primaryPlatform ?? "", /platform/);
    assert.match(result.errors.contentTone ?? "", /tone/);
    assert.match(result.errors.primaryGoal ?? "", /goal/);
    assert.match(result.errors.defaultButtonLabel ?? "", /32 characters/);
  }
});
