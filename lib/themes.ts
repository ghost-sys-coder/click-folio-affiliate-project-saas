export const appThemes = {
  signalPurple: "signal-purple",
  growthMint: "growth-mint",
} as const;

export type AppTheme = (typeof appThemes)[keyof typeof appThemes];

export function themeAttribute(theme: AppTheme) {
  return { "data-theme": theme };
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
