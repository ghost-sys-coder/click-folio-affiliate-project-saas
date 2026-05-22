"use client";

import { Check, Moon, Palette, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appThemes, type AppTheme } from "@/lib/themes";

type OnboardingThemeSwitcherProps = {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
};

const onboardingThemeOptions = [
  {
    value: appThemes.growthMint,
    label: "Growth Mint",
    description: "Light, clean, revenue-focused",
    icon: Sprout,
  },
  {
    value: appThemes.signalPurple,
    label: "Signal Purple",
    description: "Dark, premium, high-contrast",
    icon: Moon,
  },
] as const;

export function OnboardingThemeSwitcher({
  theme,
  onThemeChange,
}: OnboardingThemeSwitcherProps) {
  const currentTheme =
    onboardingThemeOptions.find((option) => option.value === theme) ??
    onboardingThemeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette />
          <span className="hidden sm:inline">{currentTheme.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Page theme</DropdownMenuLabel>
        {onboardingThemeOptions.map((option) => {
          const Icon = option.icon;
          const selected = option.value === theme;

          return (
            <DropdownMenuItem
              key={option.value}
              className="gap-2"
              onSelect={() => onThemeChange(option.value)}
            >
              <Icon />
              <span className="grid flex-1 gap-0.5">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {selected ? <Check className="ml-auto" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
