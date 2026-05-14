
-- Trigger: auto-mark enrollment complete when last lesson done
DROP TRIGGER IF EXISTS trg_maybe_complete_enrollment ON public.lesson_progress;
CREATE TRIGGER trg_maybe_complete_enrollment
AFTER INSERT OR UPDATE OF completed_at ON public.lesson_progress
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION public.maybe_complete_enrollment();

-- AI summary cache
CREATE TABLE IF NOT EXISTS public.lesson_ai_summaries (
  lesson_id uuid PRIMARY KEY,
  summary jsonb NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled read summary"
ON public.lesson_ai_summaries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.course_lessons l
    JOIN public.course_modules m ON m.id = l.module_id
    WHERE l.id = lesson_ai_summaries.lesson_id
      AND (public.is_enrolled(m.course_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))
  )
);

-- AI usage log
CREATE TABLE IF NOT EXISTS public.lesson_ai_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_ai_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own queries read"
ON public.lesson_ai_queries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_lesson_ai_queries_user_day
ON public.lesson_ai_queries (user_id, created_at);

-- Realtime
ALTER TABLE public.lesson_progress REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
