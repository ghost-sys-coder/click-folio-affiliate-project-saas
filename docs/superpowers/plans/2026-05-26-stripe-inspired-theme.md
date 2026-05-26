# Stripe-Inspired Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new selectable Stripe-inspired theme that users can choose for both public profiles and the admin dashboard.

**Architecture:** Extend the existing shared theme registry and CSS token system with one new theme id, then expose that theme anywhere current theme options are rendered. Use existing `data-theme` styling so current pages inherit the new look with only minimal token-level polish.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4, shared CSS custom properties

---

### Task 1: Extend Shared Theme Registry

**Files:**
- Modify: `lib/themes.ts`

- [ ] Add a new `appThemes` entry and option label for the Stripe-inspired theme.
- [ ] Ensure the theme is included in `appThemeValues`.
- [ ] Mark the theme as dark-capable for admin usage in `darkAppThemes`.

### Task 2: Add Theme Tokens

**Files:**
- Modify: `app/globals.css`

- [ ] Add a new `[data-theme="stripe-blue"]` token block.
- [ ] Define background, surface, card, primary, accent, border, ring, chart, and sidebar variables.
- [ ] Tune `.theme-hero-glow` so the new theme gets a premium blue-indigo ambient treatment.

### Task 3: Expose Theme In Public Theme Pickers

**Files:**
- Modify: `components/onboarding/onboarding-theme-switcher.tsx`
- Modify: `lib/onboarding.ts`
- Modify: `components/onboarding/onboarding-media-step.tsx`
- Modify: `components/admin/profile-editor.tsx`

- [ ] Add the new theme option metadata to the onboarding theme switcher.
- [ ] Ensure public theme option sources automatically include the new theme.
- [ ] Verify public profile theme select inputs can choose the new theme without extra validation changes.

### Task 4: Expose Theme In Admin Theme Picker

**Files:**
- Modify: `components/admin/admin-theme.tsx`

- [ ] Add the new admin theme option with Stripe-inspired label, description, and icon.
- [ ] Ensure admin theme persistence keeps working through the existing storage/bootstrap path.

### Task 5: Verify And Polish

**Files:**
- Modify: `app/globals.css`

- [ ] Check the new theme across admin sidebar/card surfaces and public hero/profile surfaces.
- [ ] Apply only small token/polish tweaks if contrast or depth feels off.
- [ ] Run targeted lint checks for touched theme files.
