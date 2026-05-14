## Goal
Portfolio page (`/portfolio`) ke fully admin panel theke control korar moto banano — items add/edit/delete + page banner (image OR video) upload korar option.

## Changes

### 1. Database (migration)
- `cms_portfolio` table-e column add: `media_type` (text, default 'image'), `media_url` (text, nullable), `display_order` already ache.
- Notun table `cms_page_banners` (key-value style) — `page` (text PK, e.g. 'portfolio'), `media_type` ('image' | 'video'), `media_url` (text), `title` (text, optional), `subtitle` (text, optional), `updated_at`.
  - RLS: public SELECT, admin ALL.
- Storage bucket `cms-media` already public ache — same bucket use korbo video + image upload-er jonno.

### 2. Admin panel — Portfolio tab upgrade (`src/routes/_admin/admin.cms.tsx`)
- Portfolio form-e:
  - Existing fields (title, category, description, link, published)
  - **Cover image**: `ImageUploader` component (already exists) use korbo URL paste-er bodole.
  - **Display order** number input.
  - Edit functionality (currently only insert) — row click → form prefilled → update.
- New "Page Banners" tab add korbo (or Portfolio tab-er upore section):
  - Page select (Portfolio for now, future: Services, About...).
  - Media type toggle: Image / Video.
  - Upload widget (image → ImageUploader; video → new VideoUploader to cms-media bucket, max 50MB).
  - Title + subtitle text inputs.
  - Save button → upsert to `cms_page_banners`.

### 3. New component `src/components/admin/MediaUploader.tsx`
- Generalize ImageUploader to support both image & video. Accepts `accept` prop.
- Video preview with `<video controls>`.

### 4. Portfolio page rewrite (`src/routes/portfolio.tsx`)
- Fetch from Supabase:
  - `cms_page_banners` where `page='portfolio'` → render hero banner (image or `<video autoPlay muted loop playsInline>`).
  - `cms_portfolio` where `published=true` order by `display_order` → render grid using real `cover_url`/`media_url` instead of gradient placeholder.
- Tag filter built from real `category` values.
- Empty state if no items.

### 5. Keep
- Existing `Section` wrapper, glass styling, design tokens.
- RLS + admin role checks unchanged.

## Out of scope
- Other CMS tabs (blog, testimonials, etc.) untouched this round.
- Multi-page banner management UI beyond Portfolio (schema supports it though).
