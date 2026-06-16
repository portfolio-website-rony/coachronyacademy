-- Fix 1: Gate realtime SELECT on space-<uuid> topics by enrollment for course-gated spaces
DROP POLICY IF EXISTS "Authenticated realtime receive" ON realtime.messages;

CREATE POLICY "Authenticated realtime receive"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'admin-rt-%'
      THEN public.has_role(auth.uid(), 'admin'::public.app_role)
    WHEN realtime.topic() LIKE 'space-%' THEN (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1
        FROM public.community_spaces s
        WHERE s.id::text = substring(realtime.topic() from 7)
          AND (
            s.course_id IS NULL
            OR public.is_enrolled(s.course_id, auth.uid())
          )
      )
    )
    ELSE POSITION((auth.uid())::text IN realtime.topic()) > 0
  END
);

-- Fix 2: Allow admins to insert/update lesson_progress (align WITH CHECK with USING)
DROP POLICY IF EXISTS "Users manage own progress" ON public.lesson_progress;

CREATE POLICY "Users manage own progress"
ON public.lesson_progress
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = lesson_progress.enrollment_id
      AND (e.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = lesson_progress.enrollment_id
      AND (e.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);