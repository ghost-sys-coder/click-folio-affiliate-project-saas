export const appThemes = {
  signalPurple: "signal-purple",
  growthMint: "growth-mint",
  commerceGold: "commerce-gold",
  oceanCyan: "ocean-cyan",
  sunsetCoral: "sunset-coral",
  stripeBlue: "stripe-blue",
} as const;

export type AppTheme = (typeof appThemes)[keyof typeof appThemes];

export const appThemeOptions = [
  { value: appThemes.growthMint, label: "Growth Mint" },
  { value: appThemes.signalPurple, label: "Signal Purple" },
  { value: appThemes.commerceGold, label: "Commerce Gold" },
  { value: appThemes.oceanCyan, label: "Ocean Cyan" },
  { value: appThemes.sunsetCoral, label: "Sunset Coral" },
  { value: appThemes.stripeBlue, label: "Affiliate Ember" },
] as const;

export const appThemeValues = appThemeOptions.map((theme) => theme.value) as [
  AppTheme,
  ...AppTheme[],
];

const darkAppThemes = new Set<AppTheme>([
  appThemes.signalPurple,
  appThemes.commerceGold,
  appThemes.oceanCyan,
]);

export function normalizeAppTheme(theme: string | null | undefined): AppTheme {
  return appThemeValues.find((value) => value === theme) ?? appThemes.growthMint;
}

export function themeAttribute(theme: AppTheme) {
  return { "data-theme": theme };
}

export function getThemeLabel(theme: string | null | undefined) {
  return (
    appThemeOptions.find((option) => option.value === theme)?.label ??
    appThemeOptions[0].label
  );
}

export function isDarkAppTheme(theme: AppTheme) {
  return darkAppThemes.has(theme);
}

export function getThemeMode(theme: AppTheme) {
  return isDarkAppTheme(theme) ? "dark" : "light";
}

export const signalPurpleClerkAppearance = {
  variables: {
    colorBackground: "var(--surface)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorPrimary: "var(--primary)",
    colorDanger: "var(--destructive)",
    colorInputBackground: "var(--surface-soft)",
    colorInputText: "var(--foreground)",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    cardBox: "shadow-2xl border border-border",
    card: "bg-surface text-foreground",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-border bg-card text-foreground",
    formFieldInput: "border-border bg-surface-soft text-foreground",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-accent",
  },
};
