-- 1) Enrollments: require paid (verified) payment, or free course
DROP POLICY IF EXISTS "Users create own enrollment" ON public.enrollments;

CREATE POLICY "Users create own enrollment with payment"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND COALESCE(c.discount_price, c.price) = 0
    )
    OR EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.user_id = auth.uid()
        AND p.course_id = enrollments.course_id
        AND p.status IN ('verified','paid','succeeded')
    )
  )
);

-- 2) Course lessons: restrict full lessons to enrolled / admin; public only sees preview
DROP POLICY IF EXISTS "Read lessons of published" ON public.course_lessons;

CREATE POLICY "Public read preview lessons of published"
ON public.course_lessons
FOR SELECT
TO anon, authenticated
USING (
  is_preview = true
  AND EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id AND c.published
  )
);

CREATE POLICY "Enrolled or admin read full lessons"
ON public.course_lessons
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id
      AND c.published
      AND (
        public.is_enrolled(c.id, auth.uid())
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
  )
);

-- 3) Realtime: enable RLS on messages and restrict admin channels
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated realtime receive" ON realtime.messages;
CREATE POLICY "Authenticated realtime receive"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'admin-rt-%'
      THEN public.has_role(auth.uid(), 'admin'::public.app_role)
    ELSE true
  END
);

DROP POLICY IF EXISTS "Authenticated realtime send" ON realtime.messages;
CREATE POLICY "Authenticated realtime send"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'admin-rt-%'
      THEN public.has_role(auth.uid(), 'admin'::public.app_role)
    ELSE true
  END
);
