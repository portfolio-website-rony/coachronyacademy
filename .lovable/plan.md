# Phase 2 — Saved Lessons + Profile Upgrade

Notifications page is already shipped in Phase 1, so Phase 2 narrows to the remaining items: Saved Lessons feature and a real Profile page.

## 1. Database (one migration)

- **`lesson_saves`** table
  - `user_id uuid`, `lesson_id uuid`, `created_at timestamptz`, PK `(user_id, lesson_id)`
  - RLS: user manages own rows (`user_id = auth.uid()` or admin)
- **`profiles`** add columns
  - `social_links jsonb default '{}'` (website, youtube, facebook, instagram, linkedin, x)
  - `avatar_url` already exists — reuse
- **Storage**: reuse public `cms-media` bucket; avatars under `avatars/{user_id}/...`. Add storage policies so users can upload/update/delete only inside their own folder.

## 2. Saved Lessons

- **Save toggle on lesson player** (`src/routes/_student/student.courses.$slug.$lessonId.tsx`): bookmark-style button next to "Mark complete". Optimistic insert/delete on `lesson_saves`.
- **Saved page** (`src/routes/_student/student.saved.tsx`): replace ComingSoon stub. Lists saved lessons with course title, lesson title, cover, "Resume" deep link, and an unsave button. Empty state when none.

## 3. Profile upgrade

Rebuild `src/routes/_student/student.profile.tsx` into tabbed sections:

- **Avatar uploader**: drag/click → upload to `cms-media/avatars/{uid}/{timestamp}.{ext}` → save public URL to `profiles.avatar_url`. Show preview, remove button.
- **Account info**: display name, phone, whatsapp, bio (already partially there) — keep + polish with proper labels and validation (zod, length caps).
- **Social links**: 5 inputs (website, youtube, facebook, instagram, linkedin) → stored in `profiles.social_links` jsonb. URL validation.
- **Security**: change password form using `supabase.auth.updateUser({ password })`. Email verified badge derived from `session.user.email_confirmed_at`. "Resend verification" button via `supabase.auth.resend`.
- **Header**: show avatar + verified badge + member-since.

Also update `DashboardShell` user chip to render the avatar when present.

## 4. Out of scope (deferred)

- Phone OTP verification (Supabase phone auth) — defer; just keep the phone field text input.
- Activity log view — exists table-side; defer to Phase 3 alongside watch history.
- Notifications page polish — already done in Phase 1.

## Technical notes

- All Supabase access from the browser client (RLS enforces ownership). No new server functions needed.
- Avatar upload uses `supabase.storage.from('cms-media').upload(...)` with `upsert: true`, then `getPublicUrl`.
- Validate inputs with `zod` (already in project).
- Tabs: shadcn `Tabs` component (already installed).

## Files

Created:
- `supabase/migrations/<ts>_phase2_saves_profile.sql`
- `src/components/student/SaveLessonButton.tsx`
- `src/components/student/AvatarUploader.tsx`

Updated:
- `src/routes/_student/student.saved.tsx` (replace stub)
- `src/routes/_student/student.profile.tsx` (full rebuild with tabs)
- `src/routes/_student/student.courses.$slug.$lessonId.tsx` (add save button)
- `src/components/dashboard/DashboardShell.tsx` (avatar in user chip)

After this loop, say **"next phase"** for Phase 3 (Learning Progress v2 — weekly chart, watch history, streak drill-down).
