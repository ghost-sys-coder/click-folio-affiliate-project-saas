import { appThemeValues, appThemes, getThemeMode, type AppTheme } from "./themes.ts";

export const ADMIN_THEME_STORAGE_KEY = "clickfolio-admin-theme";
export const ADMIN_THEME_EVENT = "clickfolio-admin-theme-change";
export const ADMIN_THEME_CONTEXT_ATTRIBUTE = "data-admin-theme-context";

export function resolveAdminTheme(value: string | null | undefined): AppTheme {
  return appThemeValues.find((theme) => theme === value) ?? appThemes.growthMint;
}

export function getAdminThemeMode(theme: AppTheme) {
  return theme === appThemes.stripeBlue ? "dark" : getThemeMode(theme);
}

export function buildAdminThemeBootstrapScript() {
  const defaultTheme = appThemes.growthMint;
  const themeValues = JSON.stringify(appThemeValues);
  const darkThemes = JSON.stringify(
    appThemeValues.filter((theme) => getAdminThemeMode(theme) === "dark")
  );
  const adminThemeContextAttribute = JSON.stringify(ADMIN_THEME_CONTEXT_ATTRIBUTE);

  return `(() => {
    const storageKey = ${JSON.stringify(ADMIN_THEME_STORAGE_KEY)};
    const defaultTheme = ${JSON.stringify(defaultTheme)};
    const validThemes = new Set(${themeValues});
    const darkThemes = new Set(${darkThemes});
    const root = document.documentElement;
    const body = document.body;
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = validThemes.has(storedTheme) ? storedTheme : defaultTheme;
    const themeMode = darkThemes.has(theme) ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
    root.setAttribute(${adminThemeContextAttribute}, "true");
    body.setAttribute(${adminThemeContextAttribute}, "true");
    root.style.colorScheme = themeMode;
    root.classList.toggle("dark", themeMode === "dark");
  })();`;
}
