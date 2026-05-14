
# CoachRony Student LMS — Full Rebuild Plan

Tomar PRD ta khub boro. Ek loop e sob korle bug ashbe + quality nosto hobe. Tai ami **6 phase** e bhag korlam. Prottek phase ek loop e hobe. Tumi "next phase" / "phase X" bolle ami egiye jabo.

Onek kichu already ache (auth, courses, enrollments, lesson_progress, video player Phase 1 done, profile, progress page, notifications table, payments, community). Ekhon **bug fix + missing module** e focus.

---

## Current state audit (already built)

- ✅ Auth (email + password) + Google OAuth ready, role-based redirect
- ✅ Student layout shell, sidebar nav
- ✅ Courses list + course detail + checkout
- ✅ Enrollment + lesson_progress + auto-complete trigger
- ✅ Video player upgrade (speed, autoplay, mark complete, notes, bookmarks, lesson sidebar) — Phase 1 done last loop
- ✅ Profile basic edit (name, phone, bio)
- ✅ Progress page (course-wise %)
- ✅ Community (spaces, posts, comments, likes) with RLS
- ✅ Notifications table + admin bell
- ✅ Payments table + auto-enroll trigger + coupon system

## Gaps to fix

- ❌ Missing sidebar items: Workshops, Ebooks, Bundles, Certificates, Orders, Saved Lessons, Notifications page
- ❌ Dashboard overview is thin (no Continue Learning card, no analytics, no upcoming workshops, no notifications feed)
- ❌ Profile: no avatar upload, no social links, no password change, no verified badge, no activity log view
- ❌ No certificate generation / PDF / public verify page
- ❌ No ebooks / bundles / workshops schema or pages
- ❌ No orders/invoice page for students
- ❌ No "Saved lessons" feature (lesson_saves table missing)
- ❌ No realtime notifications subscription on student side
- ❌ No weekly activity chart on progress page
- ❌ Reported "current implementation not working" — need to verify auth-hydration race (loader 401), broken nav links, lesson player edge cases

---

## Phase plan

### Phase 1 — Stabilize + Dashboard Overview rebuild  ← THIS LOOP

**Goal:** Fix existing bugs + ship a real Continue-Learning dashboard so the system feels alive.

Files:
- `src/routes/_student/student.tsx` (Overview rebuild)
- `src/routes/_student.tsx` (verify auth gate, add notifications bell)
- `src/components/dashboard/DashboardShell.tsx` (add student notification bell + new nav items, even if pages are stubs initially)
- New: `src/components/student/ContinueLearningCard.tsx`, `RecentActivityCard.tsx`, `UpcomingCard.tsx`

Features:
1. **Auth race fix** — ensure student loader waits for `supabase.auth.getSession()` to hydrate before any RLS query (use the `useAuthReady` pattern from stack-overflow context).
2. **Continue Learning** — last 3 enrollments by `lesson_progress.last_watched_at`, big card with cover + % + "Resume" → deep link to `/student/courses/:slug/:lessonId`.
3. **Active courses grid** — all enrollments with progress bar.
4. **Recent notifications** (top 5, mark-as-read inline).
5. **Stat tiles** — courses enrolled, lessons completed, hours watched (sum of `watched_seconds`), current streak (days with progress).
6. **Realtime** — subscribe to `notifications` channel for live new-notification toasts + bell badge update.
7. **Sidebar nav additions** — add Workshops, Ebooks, Bundles, Certificates, Orders, Saved, Notifications (route stubs ok this phase).

### Phase 2 — Notifications page + Saved Lessons + Profile upgrade

- `/student/notifications` — full page, filter all/unread, mark-all-read, infinite scroll.
- New table `lesson_saves(user_id, lesson_id)` + `/student/saved` page + save toggle button on lesson player.
- Profile: avatar upload to `cms-media/avatars/{uid}/...`, social links (json column on profiles), password change form, account activity feed (already have `activity_log`).
- Email verified badge (read from `auth.users.email_confirmed_at` via auth session).
- Phone OTP — defer or simple flow with Supabase phone auth (decide in that loop).

### Phase 3 — Learning Progress v2

- Weekly activity chart (recharts) from `lesson_progress.last_watched_at` last 12 weeks.
- Watch history page.
- Per-course module breakdown drill-down.
- Streak calculation + display.

### Phase 4 — Certificates

- New table `certificates(id, user_id, course_id, issued_at, verification_code)`.
- Auto-issue on `enrollments.completed_at` via trigger.
- Server function generates PDF (using `pdf-lib` — Worker-compatible).
- `/student/certificates` list + download.
- Public `/cert/:code` verification page.

### Phase 5 — Digital Products (Ebooks, Bundles, Workshops, Orders)

Biggest. New schema:
- `ebooks(title, slug, cover_url, pdf_url, price, published)`
- `bundles(title, slug, items jsonb, price)`
- `workshops(title, slug, scheduled_at, replay_url, join_url, price)`
- `ebook_purchases`, `bundle_purchases`, `workshop_registrations` (or unify via `payments.product_type`).

Pages:
- `/student/ebooks`, `/student/bundles`, `/student/workshops` (purchased only)
- `/student/orders` from `payments` table with invoice download (HTML-to-PDF via server fn).

Admin upload pages for each product type.

### Phase 6 — Polish, realtime, mobile, admin UX

- Mobile responsive audit (sidebar drawer, player layout).
- Notification triggers: new lesson added → notify enrolled, workshop reminder cron, payment confirmation already exists.
- Admin manual enrollment UI polish.
- SEO meta on every public page.
- Performance: route-level code split, image lazy load.

---

## Out of scope (deferred per earlier agreement)

- AI Learning Assistant chat
- Gamification (badges, points)
- Smart recommendations
- Native mobile app
- Quiz / Assignments
- Live class video integration (Zoom/Meet embed) — only join links

---

## Technical notes (for reference)

- Stack: TanStack Start v1 + React 19 + Tailwind v4 + Supabase. Use `createServerFn` for server logic, never Edge Functions.
- Auth: use `requireSupabaseAuth` middleware for any server fn that hits user data.
- RLS: all new tables get RLS + `user_id = auth.uid()` policies (admin via `has_role`).
- Realtime: enable on `notifications`, `lesson_progress` via `ALTER PUBLICATION supabase_realtime ADD TABLE ...`.
- PDF: `pdf-lib` (pure JS, Worker-safe). NOT puppeteer/sharp.
- Storage: reuse existing `cms-media` bucket for avatars + ebook covers; create `ebooks-pdf` private bucket for paid PDFs with signed URLs.

---

**Approve hole ami Phase 1 (Stabilize + Dashboard Overview) start korbo. Done hole tumi "next phase" bolle Phase 2 dhorbo.**
