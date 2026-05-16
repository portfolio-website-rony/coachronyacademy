## Goal
Make the entire site (public pages + Student/Client/Admin dashboards) cleanly usable on mobile (320–414px), tablet (768px), and desktop. Focus on the spots that break today.

## Findings from audit

**Public site (Header / pages)**
- `src/components/site/Header.tsx`: on mobile the user avatar, notification bell (`UserBell`), and theme toggle are completely hidden — they only show at `lg:`. Logged-in users on phones can't access notifications or the account menu from the header.
- Mobile nav drawer doesn't show profile info or links to Profile/Courses/Ebooks (only a "Dashboard" button).
- Most marketing pages already use responsive grids; spot-check Hero/Footer for horizontal overflow at 360px.

**Student dashboard (`_student.tsx` + DashboardShell)**
- Sidebar nav has 11 items; mobile drawer works but the top mobile bar (`h-12`) is very thin and lacks the notification bell / user menu — same issue as the site header.
- `student.index.tsx`, `student.community.tsx`, `student.orders.tsx`, `student.progress.tsx`, `student.notifications.tsx` use tables / wide cards — need to verify horizontal scroll wrappers and stack on small screens.
- Lesson player route (`student.courses.$slug.$lessonId.tsx`) and AI tutor panel commonly overflow on phones.

**Client dashboard**
- Same shell as Student, lighter content. Mostly fine but `client.payments.tsx` / `client.projects.tsx` likely need table wrappers checked.

**Admin dashboard (`AdminShell.tsx`)**
- Sidebar drawer works on mobile. Tables in `admin.users`, `admin.payments`, `admin.leads`, `admin.bookings` are already wrapped in `overflow-x-auto` ✓.
- But other admin pages (`admin.students`, `admin.clients`, `admin.community`, `admin.activity`, `admin.cms`, `admin.courses`, `admin.courses_.$courseId`) need the same wrapper audit.
- Header bar lacks a page title on mobile (only menu icon + bell + "View site").
- `NotificationBell` dropdown / `LeadDrawer` / `BookingDrawer` need width caps on small viewports.

**Cross-cutting issues to fix**
1. Header on mobile: surface avatar menu + notification bell (currently `lg:`-only).
2. Mobile sidebar top bar (Student/Client) too thin; add user actions there.
3. All data tables: ensure parent has `overflow-x-auto` and table has `min-w-[Npx]` so columns don't squish.
4. Long page titles / stat numbers: use `text-xl sm:text-2xl lg:text-3xl` and `truncate` where needed.
5. Dialogs/Drawers: use `max-w-[calc(100vw-2rem)]`.
6. Lesson player: video container `aspect-video w-full`, AI panel collapses below video on `<lg`.
7. Forms (book/free-class/signup/login): single column on mobile, full-width inputs.

## Scope of changes (UI only — no business logic)

### Phase 1 — Shell fixes (highest impact)
- `src/components/site/Header.tsx`: show `UserBell` + avatar (with dropdown) on mobile too; reorganize buttons so they fit at 360px.
- `src/components/dashboard/DashboardShell.tsx`: enrich the mobile top bar (`h-12` → `h-14`) with user menu + notification bell.
- `src/components/admin/AdminShell.tsx`: add page title slot in mobile header; cap NotificationBell dropdown width.

### Phase 2 — Tables & wide content
Wrap all `<table>` instances in `<div className="overflow-x-auto"><table className="min-w-[640px]">` for:
- Student: `student.orders.tsx`, `student.progress.tsx`, `student.notifications.tsx`, `student.community.tsx`
- Client: `client.payments.tsx`, `client.projects.tsx`, `client.meetings.tsx`
- Admin: `admin.students.tsx`, `admin.clients.tsx`, `admin.community.tsx`, `admin.activity.tsx`, `admin.cms.tsx`, `admin.courses.tsx`, `admin.courses_.$courseId.tsx`, `admin.meetings.tsx`

### Phase 3 — Page-level polish
- Stat grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` across all dashboard index pages.
- Lesson player (`student.courses.$slug.$lessonId.tsx`): stack video/AI panel on `<lg`; AI panel collapsible.
- Dialogs/Drawers (`LeadDrawer`, `BookingDrawer`, payment screenshot modal): `w-full max-w-[calc(100vw-2rem)] sm:max-w-lg`.
- Forms (`book.tsx`, `free-class.tsx`, `signup.tsx`, `login.tsx`): grids collapse to single column on mobile.

### Phase 4 — QA pass
- Browser-test at 360×800, 414×896, 768×1024, 1280×720 on:
  - `/`, `/courses`, `/about`, `/contact`, `/book`
  - `/student`, `/student/courses`, `/student/courses/:slug/:lessonId`, `/student/community`, `/student/orders`
  - `/client`, `/client/payments`
  - `/admin`, `/admin/users`, `/admin/payments`, `/admin/courses`, `/admin/cms`
- Check no horizontal page scroll, all CTAs reachable, drawers don't clip, tables scroll cleanly.

## Out of scope
- No backend / RLS / business-logic changes.
- No redesign of components — only responsive tweaks (Tailwind classes, layout structure).
- No new dependencies.

## Estimated edits
~15–20 files modified, all small className/structure changes. No migrations.
