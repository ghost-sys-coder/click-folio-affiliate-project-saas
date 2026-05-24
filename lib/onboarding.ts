import { appThemes, type AppTheme } from "./themes.ts";

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
  { value: appThemes.commerceGold, label: "Commerce Gold" },
] as const;

export const onboardingPlatforms = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "newsletter", label: "Newsletter" },
  { value: "blog", label: "Blog or SEO" },
  { value: "other", label: "Other" },
] as const;

export const onboardingContentTones = [
  { value: "direct", label: "Direct" },
  { value: "expert", label: "Expert" },
  { value: "friendly", label: "Friendly" },
  { value: "editorial", label: "Editorial" },
  { value: "premium", label: "Premium" },
] as const;

export const onboardingPrimaryGoals = [
  { value: "organize-links", label: "Organize my links" },
  { value: "grow-revenue", label: "Grow affiliate revenue" },
  { value: "build-audience", label: "Build an audience" },
  { value: "track-performance", label: "Track performance" },
  { value: "launch-campaigns", label: "Launch campaigns" },
] as const;

export type OnboardingValues = {
  username: string;
  displayName: string;
  niche: string;
  theme: AppTheme;
  bio: string;
  disclosureText: string;
  avatarUrl: string;
  coverImageUrl: string;
  targetAudience: string;
  primaryPlatform: string;
  contentTone: string;
  primaryGoal: string;
  defaultButtonLabel: string;
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
export const defaultDisclosure =
  "Some links on this page may earn me a commission at no extra cost to you.";

export function getDefaultOnboardingValues(
  displayName = "",
  usernameSeed = "",
  avatarUrl = ""
): OnboardingValues {
  return {
    username: normalizeUsername(usernameSeed),
    displayName,
    niche: "creator-tools",
    theme: appThemes.growthMint,
    bio: "",
    disclosureText: defaultDisclosure,
    avatarUrl,
    coverImageUrl: "",
    targetAudience: "Affiliate marketers",
    primaryPlatform: "instagram",
    contentTone: "direct",
    primaryGoal: "organize-links",
    defaultButtonLabel: "View Deal",
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
    avatarUrl: readFormValue(formData, "avatarUrl"),
    coverImageUrl: readFormValue(formData, "coverImageUrl"),
    targetAudience: readFormValue(formData, "targetAudience"),
    primaryPlatform: readFormValue(formData, "primaryPlatform"),
    contentTone: readFormValue(formData, "contentTone"),
    primaryGoal: readFormValue(formData, "primaryGoal"),
    defaultButtonLabel:
      readFormValue(formData, "defaultButtonLabel") || "View Deal",
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

  if (values.avatarUrl && !isValidHttpUrl(values.avatarUrl)) {
    errors.avatarUrl = "Upload a valid image URL for your avatar.";
  }

  if (values.coverImageUrl && !isValidHttpUrl(values.coverImageUrl)) {
    errors.coverImageUrl = "Upload a valid image URL for your cover image.";
  }

  if (
    values.targetAudience.length < 2 ||
    values.targetAudience.length > 90
  ) {
    errors.targetAudience = "Describe your audience in 2-90 characters.";
  }

  if (
    !onboardingPlatforms.some(
      (platform) => platform.value === values.primaryPlatform
    )
  ) {
    errors.primaryPlatform = "Choose your primary platform.";
  }

  if (
    !onboardingContentTones.some((tone) => tone.value === values.contentTone)
  ) {
    errors.contentTone = "Choose the content tone that fits your brand.";
  }

  if (!onboardingPrimaryGoals.some((goal) => goal.value === values.primaryGoal)) {
    errors.primaryGoal = "Choose your primary onboarding goal.";
  }

  if (
    values.defaultButtonLabel.length < 2 ||
    values.defaultButtonLabel.length > 32
  ) {
    errors.defaultButtonLabel = "Keep the default button label within 32 characters.";
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

  if (value === appThemes.commerceGold) {
    return appThemes.commerceGold;
  }

  return appThemes.growthMint;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
