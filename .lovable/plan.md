## Goal

CoachRony-এ একটা complete multi-role platform বানানো — public users register/login করতে পারবে, signup-এ account type (Student / Client) choose করবে, এবং role অনুযায়ী আলাদা premium dashboard পাবে। Admin dashboard আগে থেকেই আছে — সেটা enhance হবে। সব কিছুতে glassmorphism, dark theme, responsive layout এবং realtime updates।

কাজটা বড়, তাই **৪টা phase**-এ ভাগ করেছি যাতে প্রতিটা step approve করে এগোতে পারো। এই plan-এ Phase 1 এর full detail + Phase 2-4 এর outline দিলাম।

---

## Phase 1 — Auth foundation + role system (এই plan approve করলে শুরু)

### 1.1 Database migration

**Extend `app_role` enum** — `student` ও `client` যোগ:
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';
```

**নতুন `profiles` table** (auth.users-এর সাথে linked, কিন্তু FK ছাড়া per Lovable rules):
- `id uuid PK` = `auth.users.id`
- `display_name text`, `avatar_url text`, `phone text`, `whatsapp text`, `bio text`
- `account_type text` (student | client) — signup-এ choose করা value
- `onboarded bool default false`
- standard `created_at`, `updated_at`

**নতুন `notifications` table**:
- `id, user_id, type, title, body, link, read bool, created_at`
- Realtime publication-এ যোগ হবে

**নতুন `activity_log` table**:
- `id, user_id, action, metadata jsonb, created_at`

**Trigger**: `on_auth_user_created` → auto-create profile row + assign default role (signup form-এর `account_type` থেকে)। Admin bootstrap trigger অপরিবর্তিত।

**RLS policies**:
- `profiles`: user নিজের row read/update করতে পারবে; admin সব করতে পারবে।
- `notifications`: user শুধু নিজের notification দেখবে/mark-read করবে; admin/system insert করবে।
- `activity_log`: user নিজেরটা read; admin সব দেখবে।

**Realtime enable** — `notifications` ও `activity_log` table `supabase_realtime` publication-এ যোগ।

### 1.2 Auth pages (public)

নতুন route files:
- `src/routes/login.tsx` — Email/password + Google sign-in (Lovable managed OAuth, `lovable.auth.signInWithOAuth("google", ...)`). Login সফল → `/dashboard` redirect।
- `src/routes/signup.tsx` — name + email + password + **account type selector** (Student / Client card-style toggle) + Google option। Signup সফল → email confirm prompt → login।
- `src/routes/forgot-password.tsx` + `src/routes/reset-password.tsx` — standard flow।
- `src/routes/dashboard.tsx` — role-aware redirect: admin → `/admin`, student → `/student`, client → `/client`।

Auto-confirm email — **off** (default), user email verify করে login করবে।

### 1.3 Header update

`src/components/site/Header.tsx`-এ:
- Logged-out: existing "Book a Call" + নতুন "Login" link।
- Logged-in: avatar dropdown → Dashboard, Profile, Logout।
- `useAuthUser()` hook দিয়ে session detect হবে।

### 1.4 Shared building blocks

- `src/lib/auth/use-auth-user.ts` — session + profile + role(s) hook (existing `useAdmin` pattern follow করে)।
- `src/lib/auth/role-guard.tsx` — `_student.tsx`, `_client.tsx` layout route-এ ব্যবহার হবে।
- `src/components/dashboard/DashboardShell.tsx` — reusable glassmorphism shell (sidebar + topbar + notification bell + AI assistant launcher) যেটা Student/Client/Admin তিনটাই use করবে variant হিসেবে।

---

## Phase 2 — Student Dashboard (`/student/*`)

Routes (`src/routes/_student/`):
- `student.tsx` — overview: enrolled courses count, progress %, upcoming events, latest notifications।
- `student.courses.tsx` — enrolled courses list, continue learning card।
- `student.progress.tsx` — module-wise progress bars, completion certificates।
- `student.community.tsx` — discussion feed (simple posts table)।
- `student.resources.tsx` — downloadable PDFs/links curated by admin।
- `student.profile.tsx` — edit profile।

DB additions: `course_enrollments`, `course_progress`, `community_posts`, `resources` tables (RLS: student নিজেরটা; admin সব)।

---

## Phase 3 — Client Dashboard (`/client/*`)

Routes (`src/routes/_client/`):
- `client.tsx` — overview: active projects, upcoming meetings, payment due।
- `client.projects.tsx` — project list with status (existing `cms_portfolio`-এর সাথে link), milestones।
- `client.meetings.tsx` — upcoming/past bookings (existing `bookings` table থেকে, client_id দিয়ে filter), join meeting link।
- `client.payments.tsx` — invoice/payment history (existing `payments` table)।
- `client.messages.tsx` — admin-client thread (নতুন `messages` table)।

DB additions: `projects` table (client_id সহ), `messages` table। Existing `bookings`/`payments` RLS update — client নিজের row select করতে পারবে।

---

## Phase 4 — Admin enhancements + cross-cutting features

- **Admin** এ নতুন pages: `admin.users.tsx` (all auth users + role assign), `admin.analytics.tsx` (charts), `admin.notifications.tsx` (broadcast)।
- **Notification bell** — সব dashboard-এ realtime unread count + dropdown।
- **Calendar widget** — Student/Client/Admin overview-এ upcoming events/meetings (FullCalendar-lite custom component)।
- **AI assistant** — floating launcher → side drawer chat, Lovable AI Gateway (`google/gemini-2.5-flash`) দিয়ে context-aware reply (current page + role পাঠাবে)। Server function `src/lib/ai/assistant.functions.ts`।
- **Activity tracking** — major actions-এ `activity_log` insert (server fn helper)।
- **Animations** — framer-motion দিয়ে page transitions, card hover, sidebar slide।
- **Mobile** — সব dashboard sidebar collapsible, bottom-tab fallback।

---

## Technical notes

- Auth: Supabase email/password + Lovable managed Google OAuth (`@/integrations/lovable`)। GitHub/অন্য provider না।
- Role check: `has_role()` security definer function (already exists) — recursion-safe।
- Server-side queries: `createServerFn` + `requireSupabaseAuth` middleware। Loaders-এ direct DB query না।
- Realtime: `supabase.channel().on('postgres_changes', ...)` notifications + dashboard counters-এ।
- Design tokens: existing `src/styles.css` এর glassmorphism, gradient-primary, shadow-glow reuse। নতুন color hardcode না।
- `routeTree.gen.ts` auto-generated — touch করব না।

---

## Out of scope (এই multi-phase plan-এ)

- Course video player / LMS player (course list + progress শুধু)।
- Payment gateway integration (Lovable Stripe/Paddle আলাদা decision)।
- Email templates customization (default Supabase emails)।
- Mobile native app।

---

## আপনার কাছে questions

1. **Account types** — Student + Client দুইটাই ঠিক, নাকি আরো (mentor, affiliate ইত্যাদি) লাগবে?
2. **Phase order** — Phase 1 (auth foundation) এখন approve করি, তারপর একটা একটা করে Phase 2 → 3 → 4 এগোবো? নাকি সব একসাথে চান (অনেক বড় হবে, error risk বেশি)?
3. **Google sign-in** — managed Google OAuth (Lovable Cloud default) ঠিক আছে, নাকি শুধু email/password?
4. **AI assistant** — Lovable AI Gateway-এর `gemini-2.5-flash` (free, fast) চালাবো — ঠিক?

আপনি confirm করলেই Phase 1 (DB migration + auth pages + header) implement শুরু করব।
