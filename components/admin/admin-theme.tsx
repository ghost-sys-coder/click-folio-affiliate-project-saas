"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Coins, Megaphone, Moon, Sprout, SunMedium, Waves } from "lucide-react";

import {
  appThemes,
  type AppTheme,
} from "@/lib/themes";
import {
  ADMIN_THEME_EVENT,
  ADMIN_THEME_CONTEXT_ATTRIBUTE,
  ADMIN_THEME_STORAGE_KEY,
  getAdminThemeMode,
  resolveAdminTheme,
} from "@/lib/admin-theme-bootstrap";

export type AdminThemeOption = {
  value: AppTheme;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const adminThemeOptions: AdminThemeOption[] = [
  {
    value: appThemes.growthMint,
    label: "Growth Mint",
    description: "Light dashboard theme",
    icon: Sprout,
  },
  {
    value: appThemes.signalPurple,
    label: "Signal Purple",
    description: "Dark workspace theme",
    icon: Moon,
  },
  {
    value: appThemes.commerceGold,
    label: "Commerce Gold",
    description: "Premium gold theme",
    icon: Coins,
  },
  {
    value: appThemes.oceanCyan,
    label: "Ocean Cyan",
    description: "Deep teal theme with crisp contrast",
    icon: Waves,
  },
  {
    value: appThemes.sunsetCoral,
    label: "Sunset Coral",
    description: "Warm editorial theme with soft highlights",
    icon: SunMedium,
  },
  {
    value: appThemes.stripeBlue,
    label: "Affiliate Ember",
    description: "Warm offer-driven theme with bold CTA energy",
    icon: Megaphone,
  },
];

function isAdminTheme(value: string | null): value is AppTheme {
  return resolveAdminTheme(value) === value;
}

function getStoredAdminTheme() {
  if (typeof window === "undefined") {
    return appThemes.growthMint;
  }

  const storedTheme = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
  return isAdminTheme(storedTheme) ? storedTheme : appThemes.growthMint;
}

function subscribeToAdminTheme(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_THEME_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ADMIN_THEME_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ADMIN_THEME_EVENT, callback);
  };
}

export function setAdminTheme(theme: AppTheme) {
  window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(ADMIN_THEME_EVENT));
}

export function useAdminTheme() {
  const theme = React.useSyncExternalStore(
    subscribeToAdminTheme,
    getStoredAdminTheme,
    () => appThemes.growthMint
  );

  return {
    theme,
    setTheme: setAdminTheme,
  };
}

export function AdminThemeShell({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootTheme = root.getAttribute("data-theme");
    const previousBodyTheme = body.getAttribute("data-theme");
    const previousColorScheme = root.style.colorScheme;
    const previousDarkClass = root.classList.contains("dark");
    const themeMode = getAdminThemeMode(theme);

    root.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
    root.setAttribute(ADMIN_THEME_CONTEXT_ATTRIBUTE, "true");
    body.setAttribute(ADMIN_THEME_CONTEXT_ATTRIBUTE, "true");
    root.style.colorScheme = themeMode;
    root.classList.toggle("dark", themeMode === "dark");

    return () => {
      if (previousRootTheme) {
        root.setAttribute("data-theme", previousRootTheme);
      } else {
        root.removeAttribute("data-theme");
      }

      if (previousBodyTheme) {
        body.setAttribute("data-theme", previousBodyTheme);
      } else {
        body.removeAttribute("data-theme");
      }

      root.removeAttribute(ADMIN_THEME_CONTEXT_ATTRIBUTE);
      body.removeAttribute(ADMIN_THEME_CONTEXT_ATTRIBUTE);

      root.style.colorScheme = previousColorScheme;
      root.classList.toggle("dark", previousDarkClass);
    };
  }, [theme]);

  return (
    <div className="min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}
