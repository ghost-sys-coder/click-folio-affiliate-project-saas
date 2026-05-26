# Stripe-Inspired Hybrid Theme Design

## Goal

Add a new selectable Stripe-inspired theme to Clickfolio without removing or changing any existing themes.

The new theme should:
- be available in both public profile theme selection and admin/dashboard theme selection
- feel like one theme family across the product
- render lighter and cleaner on public profile surfaces
- render darker and more dashboard-oriented in admin surfaces

## User Outcome

Users can choose a new Stripe-inspired theme anywhere themes are currently selected. Public-facing pages get a polished fintech-style light presentation, while admin gets a premium dark workspace treatment built from the same visual family.

## Scope

In scope:
- add a new shared theme key and label
- add theme tokens in global CSS
- expose the theme in public/profile selection flows
- expose the theme in admin theme selection flows
- add small theme-specific polish where existing shared glow/card treatment needs it

Out of scope:
- replacing any current theme
- redesigning layout structure
- changing payment integration or Stripe-hosted UI
- page-by-page custom visual rewrites

## Approach

Recommended approach: add the new theme to the existing shared theme system and layer in a small amount of theme-specific visual polish.

Why:
- lowest risk because the app already uses centralized `data-theme` tokens
- keeps theme logic consistent across admin, onboarding, and public profile pages
- avoids fragmenting the product with separate public/admin theme ids
- allows the new theme to feel intentional rather than like a simple recolor

## Theme Direction

Theme family name:
- working label: `Stripe Blue`

Public expression:
- light mode
- crisp white and cool-slate surfaces
- indigo/blue accent system
- subtle radial glow and premium fintech polish
- clean, low-noise contrast for profile pages

Admin expression:
- dark navy/graphite surfaces
- brighter blue-indigo accent treatment
- stronger card separation and sidebar contrast
- premium product-dashboard feel

Shared family signals:
- same accent hue family
- same radius language
- same border refinement
- same glow behavior, tuned differently by context

## Implementation Plan

### 1. Shared theme registry

Update `lib/themes.ts`:
- add a new `appThemes` entry for the Stripe-inspired theme
- add a matching label in `appThemeOptions`
- decide whether the theme is treated as dark or light in shared helpers

Expected result:
- the theme becomes a valid selectable app theme everywhere current helpers are used

### 2. Global theme tokens

Update `app/globals.css`:
- add a new `[data-theme="..."]` block for the Stripe-inspired tokens
- define:
  - background
  - foreground
  - surface
  - surface-soft
  - card
  - popover
  - primary
  - primary-hover
  - secondary
  - muted / muted-foreground
  - accent
  - border
  - input
  - ring
  - chart colors
  - sidebar colors
- tune `theme-hero-glow` if needed so the theme has a Stripe-like ambient effect

Expected result:
- current components inherit the new look without per-component rewrites

### 3. Public-facing theme selectors

Update:
- onboarding theme switcher
- onboarding media/profile theme select
- profile editor theme select
- any public-theme option arrays reused in these flows

Expected result:
- users can select the new theme for their public profile and landing page-related profile identity

### 4. Admin theme selectors

Update:
- `components/admin/admin-theme.tsx`
- admin theme switcher option metadata

Expected result:
- users can select the same theme family for the admin dashboard

### 5. Targeted theme polish

Add minimal theme-specific polish only where current tokens are not enough:
- improve glow/hero treatment for Stripe-inspired feel
- refine card/background separation if needed
- tune sidebar accent surfaces in admin

This should stay token-driven where possible and avoid bespoke per-page styling.

## Files Likely Affected

- `lib/themes.ts`
- `app/globals.css`
- `components/onboarding/onboarding-theme-switcher.tsx`
- `components/admin/admin-theme.tsx`
- `components/admin/profile-editor.tsx`
- `components/onboarding/onboarding-media-step.tsx`
- any shared theme option source used by profile/public theme forms

## Risks

### Theme mode mismatch

Risk:
- the current shared theme helpers assign one mode per theme key, but the desired direction is hybrid across contexts

Resolution:
- keep one selectable theme id, but use its shared tokens in a way that preserves the lighter public feel and deeper admin feel through current surface composition and admin shell structure
- if needed, use minimal context-aware polish rather than splitting the theme into two separate selectable ids

### Existing component contrast

Risk:
- some existing cards, inputs, or sidebar surfaces may not look premium enough with tokens alone

Resolution:
- allow a few targeted polish adjustments, but keep them constrained and theme-aware

## Testing

Verify:
- the new theme appears in all intended selectors
- selecting it persists correctly in admin
- selecting it saves correctly for public profile theme usage
- public profile pages render legibly in the new theme
- admin sidebar, cards, borders, and text maintain accessible contrast
- no existing themes regress

## Success Criteria

- a new Stripe-inspired theme is selectable in both public and admin theme pickers
- public surfaces feel light, premium, and fintech-inspired
- admin surfaces feel dark, premium, and dashboard-oriented
- existing themes remain intact
- no theme-related runtime or typing regressions are introduced
