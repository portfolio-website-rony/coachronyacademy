
# CoachRony Student Panel — Phased Implementation Plan

PRD ta khub boro. Ek loop e sob korle quality nosto hobe + bug ashbe. Tai ami **6 phase** e bhag korlam. Prottek phase ekta alada loop e implement hobe. Tumi "next phase" bolle ami porer ta dhorbo.

Ekhon Phase 1 (Video Player Upgrade) — tomar choose kora priority — ta detail e nicche, baki phase summary.

---

## 🎯 Phase 1 — Video Player Upgrade (THIS LOOP)

**Files:** `src/components/learn/YouTubePlayer.tsx`, `src/routes/_student/student.courses.$slug.$lessonId.tsx`, new `lesson_notes` + `lesson_bookmarks` tables.

### Features
1. **Speed control** (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x) — YouTube API `setPlaybackRate`
2. **Auto-play next lesson** — toggle, on `onStateChange = ENDED` → navigate to next lesson
3. **Mark as completed** button — manual override (currently auto at 90%)
4. **Lesson sidebar in player page** — collapsible list of all course lessons with progress check, current highlighted, click to switch
5. **Notes while watching** — textarea below player, auto-saves per lesson per user, shows current timestamp button to insert `[02:35]`
6. **Bookmark timestamps** — "Bookmark current time" button, list of bookmarks with title + jump-to-time

### DB migration
```
lesson_notes (id, user_id, lesson_id, content, updated_at)  -- one per user/lesson
lesson_bookmarks (id, user_id, lesson_id, seconds, label, created_at)
```
RLS: user can CRUD own rows only.

### Player UI layout
```text
┌──────────────────────────┬──────────────┐
│   YouTube Player         │  Lesson list │
│                          │  ✓ Lesson 1  │
├──────────────────────────┤  ▶ Lesson 2  │
│ [1x▾] [Auto-next] [Done] │    Lesson 3  │
├──────────────────────────┴──────────────┤
│ Notes  |  Bookmarks                     │
│ [textarea ............ insert @ 02:35]  │
└─────────────────────────────────────────┘
```

---

## 📋 Phase 2 — Profile + Verification + Notifications page
- Profile picture upload (cms-media bucket), bio, social links (json on profiles)
- Email verification badge (already verified via Supabase auth) + Phone OTP (defer or use simple flow)
- Activity log page (table already exists)
- `/student/notifications` page — list + mark read (table exists)
- Sidebar bell badge (currently admin only) for student

## 📋 Phase 3 — Learning Progress dashboard upgrade
- Overall % across all enrollments
- Weekly activity chart (lesson_progress.last_watched_at)
- "Saved Lessons" page — new `lesson_saves` table
- Continue learning card on `/student` overview

## 📋 Phase 4 — Certificates
- New `certificates` table (auto-issued on enrollment.completed_at)
- PDF generator (server function with @react-pdf/renderer or html→pdf)
- `/student/certificates` page — view/download/share link `/cert/<id>`
- Public verification page

## 📋 Phase 5 — Digital Products (Ebooks, Bundles, Workshops)
Biggest phase. Notun schema:
- `ebooks` (title, slug, cover, pdf_url, price)
- `bundles` (title, items[])
- `workshops` (title, schedule, replay_url)
- `ebook_purchases`, `bundle_purchases`, `workshop_registrations`
- Admin upload pages + Student `/student/ebooks`, `/student/bundles`, `/student/workshops`
- "My Orders" page from payments table

## 📋 Phase 6 — Polish & Future
- Notification triggers (new lesson added → notify enrolled)
- Mobile responsive audit
- Admin manual enrollment UI (already partially exists)

---

## ⚠️ Out of scope (mentioned but deferred)
- AI Learning Assistant chat
- Gamification (badges, points)
- Smart recommendations
- Mobile app
- Quiz / Assignments
- Live class video integration (Zoom/Meet embed) — only links for now

---

**Approve hole ami Phase 1 (Video Player) start korbo. Phase 1 done hole tumi "next phase" bolle Phase 2 dhorbo.**
