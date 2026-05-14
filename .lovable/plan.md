# Phase 3 — LMS + Progress v2 + AI Lesson Q&A

Audit-and-fix pass on the existing student LMS. No schema redesign — the current tables (enrollments, course_lessons, lesson_progress, lesson_notes, lesson_bookmarks) are solid. Focus on correctness, realtime, deeper analytics, and adding AI summaries/Q&A on each lesson.

## What's broken or weak today

1. **Player progress logic** (`student.courses.$slug.$lessonId.tsx`): completion threshold uses `seconds/dur >= 0.9` but `dur` falls back to `lesson.duration_seconds` which is often `0` from the DB → completion sometimes never fires, sometimes fires instantly. Also the 5s polling interval upserts on every tick (writes amplification).
2. **Progress page** (`student.progress.tsx`): N+1 queries per enrollment, no per-lesson breakdown, no chart, no streak/time data. Reuses dashboard's N+1 pattern.
3. **Dashboard streak** is computed client-side from a 30-day pull — fine, but no weekly chart visualization.
4. **No realtime**: lesson progress, notifications, comments don't hot-update.
5. **No AI on lessons** despite being the user's top priority.
6. **Auto-enroll on completion → certificate**: trigger `maybe_complete_enrollment` exists but isn't fired (no trigger row in db). Completion never marks enrollment `completed`.

## Scope of this phase

### A. Fix progress engine (frontend only)
- In `student.courses.$slug.$lessonId.tsx`:
  - Throttle progress upserts to every ~15s (not 5s) and on pause/end only.
  - Compute completion using `duration` from player FIRST, fall back to `lesson.duration_seconds`, never default to 0.
  - When `markComplete` is clicked or 90% reached, also call a new server fn `markLessonComplete` that runs the rollup → if all lessons done, set `enrollments.completed_at`. (Alternative: install the missing trigger; see migration below.)

### B. Install the missing completion trigger (migration)
- Attach `maybe_complete_enrollment()` to `lesson_progress` AFTER UPDATE/INSERT — the function exists but no trigger row currently fires it. One-line migration.

### C. Progress v2 page (`student.progress.tsx` rewrite)
- Single query using a SQL view or a server fn returning `{enrollment_id, course_title, slug, total_lessons, done_lessons, total_seconds, last_watched_at, last_lesson_id}` in one round trip.
- Per-course card: progress bar, Continue button → last lesson, Total time watched, Last activity.
- **Weekly activity chart**: Recharts bar chart of last 14 days, grouping `lesson_progress.last_watched_at` per day (minutes watched).
- **Streak panel**: current streak + longest streak (computed from same dataset).
- **Watch history**: last 10 lessons watched, click → resume.

### D. Realtime updates
- `student.tsx` dashboard + progress page subscribe to `postgres_changes` on `lesson_progress` filtered by the user's enrollments → re-fetch on change.
- Notifications bell (`UserBell.tsx`) subscribes to `notifications` for the user.
- Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE lesson_progress, notifications;` and set REPLICA IDENTITY FULL.

### E. AI Lesson Q&A (Lovable AI Gateway, default model `google/gemini-3-flash-preview`)
- New TanStack server fn `src/lib/lesson-ai.functions.ts`:
  - `summarizeLesson({ lessonId })` → fetches lesson title + description + course context (RLS-checked via `requireSupabaseAuth` + `is_enrolled`), prompts AI to produce a 5-bullet summary + 3 key takeaways + 3 quiz questions. Cached in a new `lesson_ai_summaries` table (one row per lesson_id).
  - `askLessonQuestion({ lessonId, question, history })` → streaming chat scoped to the lesson; rejects if user not enrolled.
- New right-rail tab on lesson page: **AI Tutor** (toggles with Lessons sidebar). Two sub-tabs: "Summary" (auto-generates first time, cached after) and "Ask" (chat UI with markdown rendering via `react-markdown`).
- Usage cap: 20 questions/day/user (count rows in a new `lesson_ai_queries` log table, simple insert + count check).

### F. Database changes (single migration)

```sql
-- Trigger to fire enrollment completion rollup
CREATE TRIGGER trg_maybe_complete_enrollment
AFTER INSERT OR UPDATE OF completed_at ON public.lesson_progress
FOR EACH ROW WHEN (NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION public.maybe_complete_enrollment();

-- AI cache + usage log
CREATE TABLE public.lesson_ai_summaries (
  lesson_id uuid PRIMARY KEY,
  summary jsonb NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrolled read summary" ON public.lesson_ai_summaries
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM course_lessons l
      JOIN course_modules m ON m.id = l.module_id
      WHERE l.id = lesson_ai_summaries.lesson_id
        AND (is_enrolled(m.course_id, auth.uid()) OR has_role(auth.uid(),'admin'))
    )
  );
-- writes only via service role (server fn)

CREATE TABLE public.lesson_ai_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_ai_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own queries" ON public.lesson_ai_queries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Realtime
ALTER TABLE public.lesson_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### G. New / changed files

- **Migration**: `supabase/migrations/<ts>_phase3_lms_progress_ai.sql`
- **Created**: 
  - `src/lib/lesson-ai.functions.ts` (server fn — summarize + ask, uses `requireSupabaseAuth` + `supabaseAdmin` for cache writes)
  - `src/components/learn/AiTutorPanel.tsx` (tabs: Summary / Ask, markdown rendering)
  - `src/components/learn/WeeklyChart.tsx` (Recharts)
- **Updated**:
  - `src/routes/_student/student.courses.$slug.$lessonId.tsx` (throttling fix, completion fix, AI Tutor tab)
  - `src/routes/_student/student.progress.tsx` (full rewrite: chart, streak, history)
  - `src/routes/_student/student.tsx` (realtime subscription on lesson_progress)
  - `src/components/dashboard/UserBell.tsx` (realtime subscription on notifications)

### H. Out of scope (later phases)
- Community realtime (Phase 4)
- Stripe / payment checkout polish (Phase 5)
- Admin analytics + CRM AI assist (Phase 6)
- Certificates PDF generation (Phase 7)

## Verification
- Manually walk a lesson to 90% → confirm `lesson_progress.completed_at` set, `enrollments.completed_at` set when last lesson done.
- Open dashboard in two tabs, complete a lesson in one → other tab updates without refresh.
- Click "AI Summary" on a lesson → cached row appears in `lesson_ai_summaries`; second open is instant.
- Ask a lesson question → streamed answer renders as markdown; 21st question of the day returns rate-limit toast.

After approval I'll run the migration first, then implement the code in one pass.