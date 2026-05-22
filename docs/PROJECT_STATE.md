# Clickfolio Project State

Last updated: May 22, 2026

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

Clickfolio is an authenticated affiliate workspace. The onboarding flow is complete, and authenticated users with a local profile can access the admin dashboard.

The current implemented admin phase is affiliate link management.

## Authentication and Onboarding

- Clerk is the authentication provider.
- Clerk webhook data syncs into the local `users` table.
- Onboarding creates a local `profiles` record tied to the local user.
- Admin routes require an authenticated Clerk user.
- Admin layout resolves the Clerk user to the local onboarding state.
- Users without a profile are redirected to `/onboarding`.
- The onboarding flow should not be changed unless future features require profile fields.

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
- If the database has not been migrated, `/admin/links` renders a setup state instead of a runtime error.
- Run:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

For local development only, `npx drizzle-kit push` can be used to sync the schema faster.

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

The create link page supports importing one affiliate link into the form.

Supported formats:

- JSON paste
- JSON upload
- CSV paste
- CSV upload
- Excel upload: `.xlsx` and `.xls`

Sample downloads:

- JSON sample
- CSV sample
- Excel sample

Implementation details:

- UI component: `components/admin/affiliate-link-data-import.tsx`
- Shared parser/normalizer: `lib/affiliate-link-import.ts`
- JSON, CSV, and Excel all normalize into the same `AffiliateLinkValues` shape.
- Excel import reads the first row from the first worksheet.
- CSV import reads the first data row after the header row.
- Bulk import is not implemented yet. The current import fills the single-link creation form.

This structure is prepared for future bulk CSV/Excel imports because source parsers map into the same record normalization layer.

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

Server actions validate all form input before database writes.

## Security Model

Server logic is scoped to authenticated local users.

Important rules currently enforced:

- Server actions call Clerk `auth()`.
- Server actions resolve the current Clerk user to the local `users` and `profiles` records.
- Client-supplied `userId` is never trusted.
- All affiliate link mutations use the local `userId` resolved on the server.
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

UI primitives added or used:

- `components/ui/alert-dialog.tsx`
- `components/ui/select.tsx`
- `components/ui/empty.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/field.tsx`

## Tests

Current test files:

- `tests/affiliate-link-import.test.mts`
- `tests/clerk-user-data.test.mts`
- `tests/cloudinary.test.mts`
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

- 20 passing tests

Node test runner warnings:

- The tests emit `MODULE_TYPELESS_PACKAGE_JSON` warnings because files use ESM syntax while `package.json` does not declare `"type": "module"`.
- These warnings are existing runtime warnings and do not currently fail tests.

## Dependencies Added During Affiliate Link Phase

- `zod`
- `xlsx`

Important note:

- Installing `xlsx` reported npm audit vulnerabilities.
- `npm audit fix --force` was not run because it can introduce breaking dependency changes.

## Not Implemented Yet

The following are intentionally not implemented yet:

- Public profile rendering.
- Click tracking.
- AI content generation.
- Bulk import that creates multiple links in one action.
- Import preview table for multiple rows.
- CSV/Excel export.
- Public tracking redirect URLs.

## Recommended Next Steps

1. Add migration files for the current Drizzle schema and apply them to the active database.
2. Add create/update success feedback similar to the delete feedback.
3. Add a bulk import workflow:
   - Parse many rows.
   - Show a preview table.
   - Validate each row.
   - Allow users to fix invalid rows.
   - Create many links in one protected server action.
4. Add stronger delete UX:
   - Optional undo via archive instead of hard delete.
   - Toast or dismissible feedback.
5. Add focused tests for affiliate link server-action authorization boundaries.
6. Review npm audit output for `xlsx` and decide whether to keep `xlsx`, pin a safer version, or replace it.
