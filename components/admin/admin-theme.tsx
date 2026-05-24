"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Coins, Moon, Sprout } from "lucide-react";

import { appThemes, type AppTheme } from "@/lib/themes";

const ADMIN_THEME_STORAGE_KEY = "clickfolio-admin-theme";
const ADMIN_THEME_EVENT = "clickfolio-admin-theme-change";

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
];

function isAdminTheme(value: string | null): value is AppTheme {
  return value === appThemes.growthMint || value === appThemes.signalPurple;
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

  return (
    <div data-theme={theme} className="min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}
