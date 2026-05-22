import { appThemes, type AppTheme } from "@/lib/themes";

export const onboardingNiches = [
  { value: "creator-tools", label: "Creator tools" },
  { value: "software-saas", label: "Software and SaaS" },
  { value: "business-growth", label: "Business growth" },
  { value: "finance", label: "Finance" },
  { value: "health-fitness", label: "Health and fitness" },
  { value: "beauty-lifestyle", label: "Beauty and lifestyle" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;

export const onboardingProfileThemes = [
  { value: appThemes.growthMint, label: "Growth Mint" },
  { value: appThemes.signalPurple, label: "Signal Purple" },
] as const;

export type OnboardingValues = {
  username: string;
  displayName: string;
  niche: string;
  theme: AppTheme;
  bio: string;
  disclosureText: string;
};

export type OnboardingErrors = Partial<Record<keyof OnboardingValues, string>>;

export type OnboardingFormState = {
  errors?: OnboardingErrors;
  message?: string;
  values: OnboardingValues;
};

export type OnboardingValidationResult =
  | { ok: true; data: OnboardingValues }
  | { ok: false; errors: OnboardingErrors; values: OnboardingValues };

const usernamePattern = /^[a-z0-9][a-z0-9_-]{2,29}$/;
const defaultDisclosure =
  "Some links on this page may earn me a commission at no extra cost to you.";

export function getDefaultOnboardingValues(
  displayName = "",
  usernameSeed = ""
): OnboardingValues {
  return {
    username: normalizeUsername(usernameSeed),
    displayName,
    niche: "creator-tools",
    theme: appThemes.growthMint,
    bio: "",
    disclosureText: defaultDisclosure,
  };
}

export function validateOnboardingForm(formData: FormData) {
  const values: OnboardingValues = {
    username: normalizeUsername(readFormValue(formData, "username")),
    displayName: readFormValue(formData, "displayName"),
    niche: readFormValue(formData, "niche"),
    theme: normalizeTheme(readFormValue(formData, "theme")),
    bio: readFormValue(formData, "bio"),
    disclosureText:
      readFormValue(formData, "disclosureText") || defaultDisclosure,
  };
  const errors: OnboardingErrors = {};

  if (!usernamePattern.test(values.username)) {
    errors.username =
      "Use 3-30 lowercase letters, numbers, underscores, or hyphens.";
  }

  if (values.displayName.length < 2 || values.displayName.length > 80) {
    errors.displayName = "Display name must be between 2 and 80 characters.";
  }

  if (!onboardingNiches.some((niche) => niche.value === values.niche)) {
    errors.niche = "Choose the niche that best fits your affiliate page.";
  }

  if (values.bio.length > 180) {
    errors.bio = "Keep your bio under 180 characters.";
  }

  if (values.disclosureText.length > 220) {
    errors.disclosureText = "Keep your disclosure under 220 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values } satisfies OnboardingValidationResult;
  }

  return { ok: true, data: values } satisfies OnboardingValidationResult;
}

function readFormValue(formData: FormData, key: keyof OnboardingValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-");
}

function normalizeTheme(value: string): AppTheme {
  if (value === appThemes.signalPurple) {
    return appThemes.signalPurple;
  }

  return appThemes.growthMint;
}
