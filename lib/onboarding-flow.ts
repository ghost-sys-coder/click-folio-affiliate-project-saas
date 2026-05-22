import type { OnboardingErrors, OnboardingValues } from "./onboarding.ts";

export type OnboardingStepId = "identity" | "media" | "strategy" | "publishing";

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description: string;
  fields: Array<keyof OnboardingValues>;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Claim the profile basics people will recognize first.",
    fields: ["username", "displayName", "niche"],
  },
  {
    id: "media",
    title: "Media",
    description: "Set the visual direction for a premium public page.",
    fields: ["avatarUrl", "coverImageUrl", "theme"],
  },
  {
    id: "strategy",
    title: "Strategy",
    description: "Tell Clickfolio who you serve and how you promote.",
    fields: [
      "targetAudience",
      "primaryPlatform",
      "contentTone",
      "primaryGoal",
      "defaultButtonLabel",
    ],
  },
  {
    id: "publishing",
    title: "Publishing",
    description: "Finalize the copy and transparency layer.",
    fields: ["bio", "disclosureText"],
  },
];

export function getStepIndexForErrors(errors: OnboardingErrors | undefined) {
  if (!errors) {
    return 0;
  }

  const errorFields = new Set(Object.keys(errors));
  const stepIndex = onboardingSteps.findIndex((step) =>
    step.fields.some((field) => errorFields.has(field))
  );

  return stepIndex >= 0 ? stepIndex : 0;
}

export function canSubmitOnboardingStep(stepIndex: number) {
  return stepIndex === onboardingSteps.length - 1;
}
