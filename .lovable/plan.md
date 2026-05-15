# Security & Validation Hardening Plan — CoachRony

Enterprise-grade security across all forms, server functions, storage, auth, and RLS. Note: backend rate limiting is not implemented (no primitives available on this stack); all other layers will be hardened.

## 1. Shared Validation & Sanitization Layer

Create reusable Zod schemas + sanitization helpers used by **both** client forms and every server function.

**New files:**
- `src/lib/security/schemas.ts` — Zod primitives:
  - `safeName` (letters/spaces/Bangla unicode, 1–100, regex blocks `<>{}\\;`)
  - `safePhone` (`^\+?[0-9]{6,20}$`)
  - `safeEmail` (z.string().email().max(255))
  - `safeText` (1–5000, stripped of control chars)
  - `safeUrl` (https/http only, blocks `javascript:`, `data:`, `vbscript:`)
  - `safePassword` (≥8, upper, lower, digit)
  - `safeSlug`, `safeUuid`
- `src/lib/security/sanitize.ts`:
  - `sanitizeHtml(input)` — uses `dompurify` (allowlist: b, i, em, strong, a[href], br, p, ul, ol, li) for rich text only
  - `stripHtml(input)` — for plain-text fields (messages, comments, posts)
  - `detectMalicious(input)` — regex blocklist (`javascript:`, `<script`, `onerror=`, `onload=`, `eval(`, `document.cookie`, `DROP\s+TABLE`, `INSERT\s+INTO`, `DELETE\s+FROM`, `<iframe`, `srcdoc=`); throws `Error("Invalid or unsafe input detected.")`
- `src/lib/security/files.ts`:
  - `validateUpload(file)` — MIME + extension allowlist (jpg/jpeg/png/webp/pdf), size limits (image 5MB, pdf 10MB), rejects svg, exe, js, php, html, zip; checks magic bytes for images.

**Dependencies to add:** `dompurify`, `isomorphic-dompurify` (server-safe).

## 2. Server Function Hardening

Audit every `createServerFn` under `src/lib/**/*.functions.ts` and ensure each one:
1. Has `.inputValidator(zodSchema.parse)` — no raw passthrough validators.
2. Calls `detectMalicious()` on free-text fields before insert.
3. Uses `requireSupabaseAuth` unless explicitly public (lead/booking submission).
4. For admin-only ops, additionally checks `has_role(userId, 'admin')` server-side via a new `requireAdmin` middleware.

**New file:** `src/integrations/supabase/admin-middleware.ts` — `requireAdmin` middleware (extends `requireSupabaseAuth`, queries `user_roles`, throws 403 if not admin).

**Apply `requireAdmin` to:**
- `src/lib/admin/users.functions.ts` (list/toggle role/delete)
- Any admin-only function in courses, payments, CMS, leads, clients.

## 3. Form Validation (client-side)

Wire every public/auth form to the shared Zod schemas via `react-hook-form` + `zodResolver`:
- Lead form, Booking form, Newsletter subscribe
- Signup, Login, Reset password, Profile edit
- Community post/comment editor, Lesson notes
- Payment submission (manual screenshot)
- Admin: course/module/lesson editors, CMS editors, coupon editor

Replace any current ad-hoc validation. All free-text rendering goes through `stripHtml` or React's default text interpolation — **no `dangerouslySetInnerHTML`** unless content passes `sanitizeHtml`.

## 4. Authentication Hardening

- Call `supabase--configure_auth` with `password_hibp_enabled: true`, `auto_confirm_email: false`, `external_anonymous_users_enabled: false`, `disable_signup: false`.
- Enforce `safePassword` schema in signup + reset-password forms with inline error UX.
- Verify `/reset-password` route exists and handles `type=recovery` correctly.
- Confirm Google OAuth uses Lovable broker (`lovable.auth.signInWithOAuth("google")`) and `supabase--configure_social_auth` for `["google"]`.

## 5. RLS Audit & Fixes

Run `supabase--linter` and review every table. Current schema is largely correct, but verify/tighten:
- `lesson_ai_queries` — currently has no INSERT policy (broken). Add `INSERT WITH CHECK (user_id = auth.uid())`.
- `lesson_ai_summaries` — admin-only INSERT policy needed (currently none).
- `notifications` — INSERT policy allows users to insert for themselves; tighten to admin-only or service role for system events.
- `subscribers` — confirm public INSERT is intentional; add unique-email constraint if missing.
- All `*_views`, `activity_log` — confirm no PII leak via SELECT.

Add a single migration that patches the gaps.

## 6. Storage Bucket Security

- `cms-media` (public): keep public read, restrict INSERT/UPDATE/DELETE to admins via storage policies.
- `payment-screenshots` (private): owner-only read + admin read; INSERT only by authenticated user into their own `{user_id}/...` folder.
- Add storage policies migration if missing.
- All client uploads pass through `validateUpload()` first.

## 7. Realtime Channel Scoping

Audit `useRealtime` subscriptions:
- Notifications channel: filter `user_id=eq.{auth.uid()}`.
- Community posts: filter by `space_id` user has access to.
- Admin activity feed: only mounted under `_admin` layout.

RLS already enforces row visibility, but explicit `filter` reduces wire traffic.

## 8. Admin Panel Guards

- Confirm `_admin` layout `beforeLoad` checks `has_role('admin')` via server fn (not client-only).
- Every admin server function uses new `requireAdmin` middleware.
- Log admin mutations to `activity_log` (already exists; add inserts in admin server fns: role changes, user deletes, payment verify/reject, course publish, file delete).

## 9. Security Memory & Scan

- Create `mem://security/baseline` documenting the access-control model + intentionally-public surfaces (leads, bookings, subscribers, published courses/blog/portfolio).
- Run `security--run_security_scan` after migrations; resolve or document each finding.

## 10. Out of Scope (with reason)

- **Backend rate limiting** — not supported on this stack; documented as known gap. If you want, we can add ad-hoc client-side debouncing on public forms (lead/booking/subscribe) instead.

---

## Deliverables

**New files (~6):** validation schemas, sanitize, file validator, admin middleware, security memory, RLS migration.
**Modified files (~25):** all `*.functions.ts`, all form components, auth pages, storage upload sites.
**Migrations:** 1 (RLS patches + storage policies).
**Auth config:** 1 call to enable HIBP.

After implementation, run `supabase--linter` + `security--run_security_scan` and report findings.
