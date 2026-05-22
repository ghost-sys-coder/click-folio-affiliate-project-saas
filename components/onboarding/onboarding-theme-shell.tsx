"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { OnboardingThemeSwitcher } from "@/components/onboarding/onboarding-theme-switcher";
import { appThemes, type AppTheme } from "@/lib/themes";

type OnboardingThemeShellProps = {
  children: ReactNode;
};

export function OnboardingThemeShell({ children }: OnboardingThemeShellProps) {
  const [theme, setTheme] = useState<AppTheme>(appThemes.growthMint);

  return (
    <main
      data-theme={theme}
      className="min-h-svh bg-background text-foreground"
    >
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-4 md:px-8">
        <OnboardingThemeSwitcher theme={theme} onThemeChange={setTheme} />
      </div>
      {children}
    </main>
  );
}
