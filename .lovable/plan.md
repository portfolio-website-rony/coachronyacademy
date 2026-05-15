## Work Experience Section — Above Services

Services section-er **uporey** ekta notun "Work Experience" section add korbo, jekhane apnar past/current work places-er logo gulo **ekta sliding marquee** (continuously scroll kore) hisebe dekha jabe — ekta logo-er por ekta.

### Experience list (apnar deya)

1. DBBL Bank
2. Land Office
3. Primary School
4. High School
5. Learning & Earning Project
6. Mobile Banking
7. International Marketing (Fiverr / Freelancer)

### Implementation

**1. Logo upload — Admin theke**
- `cms_site_settings` table-e ekta key `work_experience` add korbo (JSON array)
- Each item: `{ name, logo_url, role? }`
- Admin Panel → CMS tab e notun "Work Experience" sub-section, jekhane:
  - Add new item (name + ImageUploader for logo)
  - Edit / Delete existing items
  - Reorder (display_order)

**2. Public section — `/` (home)**
- File: notun component `src/components/site/WorkExperience.tsx`
- Position: Stats section-er por, About section-er age (mane Services-er upore — ja apni cheyechen)
- Layout:
  - Eyebrow: "Experience"
  - Title: "Where I've worked"
  - Continuous **horizontal marquee** (existing testimonial marquee-er moto same animation)
  - Each card: logo + name (small caption nichey)
  - Hover korle pause hobe
  - Glassmorphism style, gold border, project-er existing design system match korbe

**3. Initial seed data**
- Migration-er sathe 7-ta item seed kore debo (logo URL khali rakhbo, admin upload korbe)
- Admin tar pore prottek-tar logo upload korbe

### Technical details

- New table na — `cms_site_settings` JSON-e store korle simple, admin UI o easy
- Logo storage: existing `cms-media` bucket use korbo
- Hook: `useContactSettings` pattern follow kore ekta `useWorkExperience` hook banabo
- Marquee: existing `animate-marquee-right` class reuse

### Files to change

- `supabase/config.toml` — na, just data seed
- Migration: insert default `work_experience` row in `cms_site_settings`
- `src/lib/site-settings.ts` — `useWorkExperience` hook add
- `src/components/site/WorkExperience.tsx` — NEW
- `src/routes/index.tsx` — section render korbo Stats-er por
- `src/routes/_admin/admin.cms.tsx` — Work Experience management UI add

### Out of scope

- Per-experience detail page
- Date ranges / timeline view (just logo carousel, jevabe apni cheyechen)
