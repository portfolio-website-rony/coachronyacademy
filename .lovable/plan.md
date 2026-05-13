## Problems identified

1. **Admin-added courses don't appear on `/courses`** — that page renders a hardcoded `PROGRAMS` array from `src/lib/site-data.ts` instead of querying the `courses` table.
2. **No Free/Paid toggle** — pricing is just a number field; no explicit "Free course" option.
3. **No cover image upload** — only a raw URL text input. The `cms-media` public storage bucket already exists, so we can upload there.

## Plan

### 1. Make `/courses` (and `/programs`) show real DB courses
- Rewrite `src/routes/courses.index.tsx` to fetch published rows from `courses` (title, slug, tagline, cover_url, price, discount_price, currency, level, category, duration_minutes).
- Render a card grid linking each card to `/courses/$slug`. Show "Free" badge when `price === 0`, otherwise show price (with strike-through on discount).
- Empty state if no published courses yet.
- Keep the hero/section styling consistent with the existing site.

### 2. Add Free / Paid toggle in admin course editor
In `src/routes/_admin/admin.courses_.$courseId.tsx`, inside the **Pricing & offer** card:
- Add a "Pricing type" segmented control: **Free** vs **Paid**.
- When "Free" selected → set `price = 0`, `discount_price = null`, hide price/discount/payment-method inputs.
- When "Paid" selected → show price, discount, currency, offer-end, payment methods (current behavior).

### 3. Add cover image upload
- Replace the "Cover image URL" text field with a combined uploader:
  - Preview thumbnail (if `cover_url` set).
  - "Upload image" button → `supabase.storage.from('cms-media').upload('course-covers/{courseId}-{timestamp}.{ext}', file)` → set `cover_url` to public URL.
  - "Remove" button to clear.
  - Keep an optional "Or paste URL" fallback for advanced users.
- Same uploader pattern available for **instructor avatar** as a small bonus (using same bucket).

### 4. Small polish on admin courses list
- After creating a new course, immediately mark it as a draft (current behavior) and navigate to editor (already happens). No DB schema change needed.

## Technical notes
- No DB migration required. `cms-media` bucket is already public; uploads work with current RLS (admin-only writes via existing storage policies if present — will verify and add policy if missing).
- All edits are in three files:
  - `src/routes/courses.index.tsx` (rewrite)
  - `src/routes/_admin/admin.courses_.$courseId.tsx` (Pricing card + Cover/Avatar uploaders)
  - Possibly add a small `<ImageUploader>` helper component in `src/components/admin/ImageUploader.tsx`.

Shall I proceed?