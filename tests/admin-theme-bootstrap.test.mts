import test from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_THEME_STORAGE_KEY,
  buildAdminThemeBootstrapScript,
  resolveAdminTheme,
} from "../lib/admin-theme-bootstrap.ts";
import { appThemes } from "../lib/themes.ts";

test("resolveAdminTheme falls back to growth mint for unknown values", () => {
  assert.equal(resolveAdminTheme("not-a-theme"), appThemes.growthMint);
});

test("resolveAdminTheme preserves supported theme values", () => {
  assert.equal(resolveAdminTheme(appThemes.oceanCyan), appThemes.oceanCyan);
});

test("bootstrap script reads localStorage and applies the saved theme to html and body", () => {
  const script = buildAdminThemeBootstrapScript();

  assert.match(script, new RegExp(ADMIN_THEME_STORAGE_KEY));
  assert.match(script, /root\.setAttribute\("data-theme", theme\)/);
  assert.match(script, /body\.setAttribute\("data-theme", theme\)/);
  assert.match(script, /root\.classList\.toggle\("dark", themeMode === "dark"\)/);
});
