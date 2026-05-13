## MVP Scope

A Skool-inspired learning platform built on the existing admin shell. Free enrollment, YouTube unlisted lessons with completion tracking, student dashboard with progress, and a global + per-course community feed. Payments and certificates deferred.

## Database (single migration)

New tables:

- `courses` — title, slug, description, cover_url, level, category, published, display_order, instructor_id
- `course_modules` — course_id, title, display_order
- `course_lessons` — module_id, title, description, youtube_url, duration_seconds, display_order, is_preview
- `enrollments` — course_id, user_id, status (active/completed), enrolled_at, completed_at; unique(course_id, user_id)
- `lesson_progress` — enrollment_id, lesson_id, watched_seconds, completed_at, last_watched_at; unique(enrollment_id, lesson_id)
- `community_spaces` — name, slug, course_id (nullable = global), description, display_order
- `community_posts` — space_id, author_id, title, body, pinned, like_count, comment_count, created_at
- `community_comments` — post_id, author_id, body, parent_id (for one-level threading), created_at
- `community_likes` — post_id, user_id; unique pair

RLS:
- Admins manage everything via `has_role(uid,'admin')`.
- Public reads `courses/modules/lessons` only when `published=true` (lessons readable only when parent course published; full video URL gated by enrollment).
- `enrollments` / `lesson_progress`: user can read/write own rows; admin sees all.
- `community_*`: any authenticated user can read posts in global spaces and in spaces of courses they're enrolled in; can create posts/comments/likes as themselves; can edit/delete own; admin moderates.

Realtime: enable `community_posts`, `community_comments`, `community_likes`, `lesson_progress`, `notifications`.

A default global space is seeded.

## Admin (extends current `/admin` shell)

New routes:
- `/admin/courses` — list with search, create button
- `/admin/courses/$courseId` — edit course meta + drag-orderable modules → lessons (paste YouTube URL, set duration, preview flag)
- `/admin/students` — list of enrolled users with course breakdown, progress %, ability to revoke enrollment
- `/admin/community` — moderate posts (pin/delete), manage spaces

Sidebar gets: Courses, Students, Community (added to existing NAV in `AdminShell.tsx`).

## Student area (new `_student` routes wired to real data)

Replace placeholder `/student/*` pages:
- `/student` — enrolled courses with progress bars, continue-learning card, recent notifications
- `/student/courses` — catalog of published courses + Enroll button (free); enrolled state shows Continue
- `/student/courses/$slug` — course landing: modules + lessons sidebar, current lesson player area
- `/student/courses/$slug/$lessonId` — lesson player (YouTube IFrame API), auto-tracks watched_seconds, marks complete at ≥90%, next/prev nav
- `/student/community` — global feed + tabs for course spaces user has access to; create post, comment, like (realtime)
- `/student/progress` — per-course module/lesson completion view

Auth gate: existing `_student.tsx` layout already requires login; add redirect to `/login` if not authed and a friendly "Enroll to access" gate when viewing a locked lesson.

## YouTube tracking

- Lesson player loads YouTube IFrame Player API (script injection in component, not global).
- On `onStateChange`, poll `getCurrentTime()` every 5s while playing.
- Upsert `lesson_progress` with `watched_seconds = max(prev, current)`, `last_watched_at = now()`.
- When `watched_seconds / duration_seconds >= 0.9`, set `completed_at` (once).
- When all lessons in a course complete → mark `enrollments.status='completed'` (DB trigger).

## Community

- Single feed component reused for global + per-space.
- Compose box (title optional, body required), markdown-lite (line breaks + links).
- Like button (optimistic), comment thread (one level of replies).
- Realtime subscription invalidates the post list on any change in scope.
- Pinned posts float to top.

## Notifications

Reuse existing `notifications` table + `NotificationBell`. Add triggers:
- New enrollment → notify admins
- New comment on your post → notify post author
- Admin pin/announcement → notify all enrolled users of that space's course

## Files to create

```
supabase/migrations/<ts>_lms_core.sql

src/routes/_admin/admin.courses.tsx
src/routes/_admin/admin.courses.$courseId.tsx
src/routes/_admin/admin.students.tsx
src/routes/_admin/admin.community.tsx

src/routes/_student/student.tsx                 (rewrite — real data)
src/routes/_student/student.courses.tsx         (rewrite — catalog)
src/routes/_student/student.courses.$slug.tsx
src/routes/_student/student.courses.$slug.$lessonId.tsx
src/routes/_student/student.community.tsx       (rewrite)
src/routes/_student/student.progress.tsx        (rewrite)

src/components/learn/CourseCard.tsx
src/components/learn/LessonSidebar.tsx
src/components/learn/YouTubePlayer.tsx
src/components/learn/EnrollButton.tsx
src/components/learn/ModuleEditor.tsx
src/components/community/Feed.tsx
src/components/community/PostComposer.tsx
src/components/community/PostCard.tsx
src/components/community/CommentThread.tsx

src/lib/learn/use-enrollment.ts
src/lib/learn/use-progress.ts
src/lib/learn/youtube.ts
```

Edit `src/components/admin/AdminShell.tsx` NAV to add Courses, Students, Community.

## Design

Continues current dark glass aesthetic (`oklch` tokens in `src/styles.css`, `glass`, `bg-gradient-primary`, `shadow-glow`). Course cards use cover image with gradient overlay; lesson sidebar mirrors Skool's left rail; community feed uses card-per-post with avatar, author, timestamp, like + comment counts. No new color tokens needed.

## Out of scope (deferred phases)

- Paid enrollment / Stripe checkout
- Certificates / PDF generation
- Quizzes & assignments
- Live cohort calendar beyond existing bookings
- Advanced analytics dashboards (basic counts only in MVP)
- Mobile app

## Build order

1. Migration + RLS + seed default global space
2. Admin: courses list → course editor (modules/lessons)
3. Student: catalog → enroll → course page → lesson player with tracking
4. Community: feed + posts + comments + likes (realtime)
5. Wire notifications triggers, polish empty states, verify in preview

After approval I'll run the migration first, then build sequentially in one continuation.
