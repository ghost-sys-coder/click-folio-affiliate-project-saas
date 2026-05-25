import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  appThemes,
  appThemeOptions,
  getThemeLabel,
  getThemeMode,
  isDarkAppTheme,
  normalizeAppTheme,
} from "../lib/themes.ts";

test("theme registry includes the new ocean and sunset themes", () => {
  assert.deepEqual(
    appThemeOptions.map((theme) => theme.value),
    [
      appThemes.growthMint,
      appThemes.signalPurple,
      appThemes.commerceGold,
      appThemes.oceanCyan,
      appThemes.sunsetCoral,
    ]
  );
});

test("normalizeAppTheme accepts the new theme values", () => {
  assert.equal(normalizeAppTheme(appThemes.oceanCyan), appThemes.oceanCyan);
  assert.equal(
    normalizeAppTheme(appThemes.sunsetCoral),
    appThemes.sunsetCoral
  );
});

test("getThemeLabel returns friendly names for all supported themes", () => {
  assert.equal(getThemeLabel(appThemes.growthMint), "Growth Mint");
  assert.equal(getThemeLabel(appThemes.signalPurple), "Signal Purple");
  assert.equal(getThemeLabel(appThemes.commerceGold), "Commerce Gold");
  assert.equal(getThemeLabel(appThemes.oceanCyan), "Ocean Cyan");
  assert.equal(getThemeLabel(appThemes.sunsetCoral), "Sunset Coral");
});

test("theme mode logic distinguishes dark and light themes", () => {
  assert.equal(getThemeMode(appThemes.growthMint), "light");
  assert.equal(getThemeMode(appThemes.sunsetCoral), "light");
  assert.equal(getThemeMode(appThemes.signalPurple), "dark");
  assert.equal(getThemeMode(appThemes.commerceGold), "dark");
  assert.equal(getThemeMode(appThemes.oceanCyan), "dark");

  assert.equal(isDarkAppTheme(appThemes.growthMint), false);
  assert.equal(isDarkAppTheme(appThemes.sunsetCoral), false);
  assert.equal(isDarkAppTheme(appThemes.signalPurple), true);
  assert.equal(isDarkAppTheme(appThemes.commerceGold), true);
  assert.equal(isDarkAppTheme(appThemes.oceanCyan), true);
});

test("global css does not alias every dark theme to signal purple tokens", () => {
  const css = readFileSync("app/globals.css", "utf8");

  assert.equal(
    /:root,\s*\[data-theme="signal-purple"\],\s*\.dark\s*\{/.test(css),
    false
  );
  assert.match(css, /\[data-theme="ocean-cyan"\]\s*\{/);
  assert.match(css, /\[data-theme="sunset-coral"\]\s*\{/);
});
