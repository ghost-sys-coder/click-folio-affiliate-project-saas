# Clickfolio Project State

Last updated: May 23, 2026

## Stack

- Next.js 16.2.6 App Router
- React 19.2.4
- Clerk authentication
- Neon Postgres through Drizzle ORM
- shadcn/ui style component set
- Tailwind CSS v4
- Zod validation
- XLSX parsing with `xlsx`

## Current Product State

Clickfolio is an authenticated affiliate workspace with public affiliate profile pages. The onboarding flow is complete, and authenticated users with a local profile can access the admin dashboard.

The current implemented phases are affiliate link management, public profile rendering, and click tracking redirects.

## Authentication and Onboarding

- Clerk is the authentication provider.
- Clerk webhook data syncs into the local `users` table.
- Onboarding creates a local `profiles` record tied to the local user.
- Admin routes require an authenticated Clerk user.
- Admin layout resolves the Clerk user to the local onboarding state.
- Users without a profile are redirected to `/onboarding`.
- The onboarding flow should not be changed unless future features require profile fields.
- The admin sidebar public page link resolves to the authenticated user's `/u/[username]` profile.

## Database State

Primary schema file: `db/schema.ts`

Current important tables:

- `users`
- `profiles`
- `affiliate_links`
- `link_clicks`
- `campaigns`
- `subscriptions`
- `ai_content`

Affiliate link fields currently modeled:

- `title`
- `description`
- `destinationUrl`
- `trackingSlug`
- `imageUrl`
- `category`
- `network`
- `commissionType`
- `commissionValue`
- `price`
- `currency`
- `buttonLabel`
- `status`
- `sortOrder`

Status enum values:

- `active`
- `inactive`
- `archive`

Known database setup note:

- The code expects an `affiliate_links` table.
- The code expects a `link_clicks` table for click tracking.
- If the database has not been migrated, `/admin/links` renders a setup state instead of a runtime error.
- Run:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

For local development only, `npx drizzle-kit push` can be used to sync the schema faster.

## Public Profile Pages

Implemented route:

- `/u/[username]`

Implemented behavior:

- Fetches profile by username.
- Returns the route-level not-found/unavailable page if the profile does not exist or is not published.
- Fetches only active affiliate links for that profile.
- Renders avatar image or initials.
- Renders display name, username, bio, niche, cover image, and affiliate disclosure.
- Renders active links as public product cards.
- Public product cards link to `/go/[linkId]`, never directly to `destinationUrl`.
- Uses the profile theme when present.
- Defaults unknown or missing themes to Growth Mint.
- Adds dynamic SEO metadata using display name and niche.
- Shows an empty state when there are no active links.
- Public profile pages do not require authentication.
- UTM params on the public profile URL are preserved into the rendered `/go/[linkId]` card links.

Important files:

- Route: `app/u/[username]/page.tsx`
- Unavailable page: `app/u/[username]/not-found.tsx`
- Public profile component: `components/public-profile/public-profile-page.tsx`
- Public profile queries: `db/public-profiles.ts`
- Theme normalization: `lib/themes.ts`

## Click Tracking

Implemented route:

- `/go/[linkId]`

Implemented behavior:

- Finds the affiliate link by ID.
- Confirms the link exists and is `active`.
- Inserts a `link_clicks` row before redirecting.
- Redirects to `affiliate_links.destinationUrl`.
- If click tracking insert fails, the visitor still redirects to the destination URL.
- If the link does not exist, redirects to `/go/unavailable`.
- If the link exists but is inactive or archived, redirects to the owning public profile when possible.
- Does not store raw IP addresses.
- Hashes forwarded IP data before storage.
- Does not build or expose the analytics dashboard yet.

Captured click fields:

- `affiliateLinkId`
- `profileId`
- `userId`
- `referer`
- `userAgent`
- `ipAddressHash`
- `country`
- `deviceType`
- `browser`
- `os`
- `source`
- `medium`
- `campaign`
- `createdAt`
- `updatedAt`

Tracking details:

- `country` is read from `x-vercel-ip-country` or `cf-ipcountry`.
- `source`, `medium`, and `campaign` are read from `utm_source`, `utm_medium`, and `utm_campaign` on `/go/[linkId]`.
- Public profile pages preserve those UTM params into `/go` links.
- Browser, OS, and device type are parsed from the user agent with basic detection.
- The public product cards use plain `<a>` elements instead of `next/link` so Next.js does not prefetch `/go` tracking endpoints.
- `/go/[linkId]` returns `204` for known prefetch requests before any DB lookup or click insert.

Important files:

- Route handler: `app/go/[linkId]/route.ts`
- Unavailable page: `app/go/unavailable/page.tsx`
- Query helper: `db/click-tracking.ts`
- Tracking utilities: `lib/click-tracking.ts`
- Tests: `tests/click-tracking.test.mts`

## Affiliate Link Management

Implemented routes:

- `/admin/links`
- `/admin/links/new`
- `/admin/links/[id]/edit`

Implemented behavior:

- List affiliate links for the authenticated user's workspace.
- Create affiliate links.
- Edit affiliate links.
- Toggle status between active and inactive.
- Archive links by setting status to `archive`.
- Delete links.
- Empty state for users with no links.
- Loading state for the links route.
- Error boundary for interrupted route rendering.
- Database setup state for missing `affiliate_links` table.
- Success and failure feedback after delete attempts.
- Delete confirmation modal before running the destructive server action.

The delete flow now requires confirmation:

- Clicking `Delete` opens an alert dialog.
- Clicking `Cancel` closes the dialog.
- Clicking `Delete link` submits the protected server action.
- Successful delete redirects to `/admin/links?linkDeleted=success`.
- Failed delete redirects to `/admin/links?linkDeleted=failed`.

## Import Support

The create link page supports both single-form imports and bulk-import workflows with preview.

Supported formats:

- JSON paste (object or array)
- JSON upload
- CSV paste (single or multiple rows)
- CSV upload
- Excel upload: `.xlsx` and `.xls` (all rows from the first worksheet)

Sample downloads:

- JSON sample (multi-record array)
- CSV sample (multi-row)
- Excel sample (multi-row workbook)

Implementation details:

- UI components: `components/admin/affiliate-link-data-import.tsx`, `components/admin/affiliate-link-bulk-preview.tsx`, `components/admin/affiliate-link-import-handler.tsx`
- Shared parser/normalizer: `lib/affiliate-link-import.ts`
- JSON, CSV, and Excel all normalize into the same `AffiliateLinkValues` shape.
- Single valid record imports fill the manual creation form.
- Multi-record imports trigger the **Bulk Preview** mode.
- The Bulk Preview table validates each row, highlights errors, and allows individual row removal.
- Bulk creation is executed via a protected server action using batch database insertion.
- Success feedback on `/admin/links` confirms the number of links imported.

Important files:

- Parser: `lib/affiliate-link-import.ts`
- Server action: `actions/affiliate-links.ts`
- Bulk Preview UI: `components/admin/affiliate-link-bulk-preview.tsx`
- Batch DB helper: `db/affiliate-links.ts`

## Validation

Affiliate link validation is in `lib/affiliate-links.ts`.

Rules include:

- `title` is required.
- `destinationUrl` must be a valid `http` or `https` URL.
- `buttonLabel` is required.
- `status` must be `active`, `inactive`, or `archive`.
- Optional text fields have max lengths.
- Numeric money fields allow positive values with up to 2 decimals.
- Currency is normalized to uppercase and must be 3 characters.

Server actions validate all form input before database writes. Bulk validation happens both on the client (for preview) and on the server (before insertion).

## Security Model

Server logic is scoped to authenticated local users.

Important rules currently enforced:

- Server actions call Clerk `auth()`.
- Server actions resolve the current Clerk user to the local `users` and `profiles` records.
- Client-supplied `userId` is never trusted.
- All affiliate link mutations use the local `userId` resolved on the server.
- Batch inserts and bulk creation server actions are protected and scoped to the user's workspace.
- Updates, status changes, archives, and deletes include `affiliate_links.userId` in the `WHERE` clause.
- Invalid link IDs and invalid statuses are rejected before database mutation.
- Users without a profile are redirected to onboarding.

Current protected server action file:

- `actions/affiliate-links.ts`

Current query helper file:

- `db/affiliate-links.ts`

## UI Components Added

Admin-specific:

- `components/admin/affiliate-link-form.tsx`
- `components/admin/affiliate-link-data-import.tsx`
- `components/admin/affiliate-link-bulk-preview.tsx`
- `components/admin/affiliate-link-import-handler.tsx`

UI primitives added or used:

- `components/ui/alert-dialog.tsx`
- `components/ui/select.tsx`
- `components/ui/empty.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/field.tsx`

Public profile:

- `components/public-profile/public-profile-page.tsx`

## Tests

Current test files:

- `tests/affiliate-link-import.test.mts`
- `tests/clerk-user-data.test.mts`
- `tests/cloudinary.test.mts`
- `tests/click-tracking.test.mts`
- `tests/database-errors.test.mts`
- `tests/onboarding-flow.test.mts`
- `tests/onboarding-submit.test.mts`
- `tests/onboarding-validation.test.mts`

Recent verification passed:

```bash
npm run lint
npm run build
node --test tests\*.test.mts
```

Current test count:

- 26 passing tests

Node test runner warnings:

- The tests emit `MODULE_TYPELESS_PACKAGE_JSON` warnings because files use ESM syntax while `package.json` does not declare `"type": "module"`.
- These warnings are existing runtime warnings and do not currently fail tests.

## Dependencies Added During Affiliate Link Phase

- `zod`
- `xlsx`

Important note:

- Installing `xlsx` reported npm audit vulnerabilities.
- `npm audit fix --force` was not run because it can introduce breaking dependency changes.

## Deployment Notes

- `next.config.ts` contains a narrow Vercel workaround for a Vercel CLI `54.3.0` / `@vercel/next@4.17.3` adapter issue.
- The issue occurs when Vercel Preview Comments injection runs through Next.js 16.2.x adapter `modifyConfig`; the Vercel adapter expects `ctx.projectDir`, but that value is not provided at that phase.
- The workaround disables only `VERCEL_PREVIEW_COMMENTS_ENABLED` during Vercel builds. Normal app build and deployment still use the Vercel adapter.

## Not Implemented Yet

The following are intentionally not implemented yet:

- AI content generation.
- CSV/Excel export.
- Analytics dashboard UI.

## Recommended Next Steps

1. Add or verify migration files for the current Drizzle schema and apply them to the active database.
2. Add create/update success feedback for single-link creation (similar to the bulk and delete feedback).
3. Add an analytics dashboard for `link_clicks`:
   - Click counts by link.
   - Referrer, country, device, browser, and OS breakdowns.
   - UTM campaign/source/medium breakdowns.
4. Add stronger delete UX:
   - Optional undo via archive instead of hard delete.
   - Toast or dismissible feedback.
5. Add focused tests for affiliate link server-action authorization boundaries.
6. Review npm audit output for `xlsx` and decide whether to keep `xlsx`, pin a safer version, or replace it.
