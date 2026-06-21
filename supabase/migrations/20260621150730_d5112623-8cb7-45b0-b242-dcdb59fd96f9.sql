
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
        SELECT 1 FROM public.community_spaces s
        WHERE s.id::text = substring(realtime.topic() from 7)
          AND (s.course_id IS NULL OR public.is_enrolled(s.course_id, auth.uid()))
      )
    )
    ELSE realtime.topic() LIKE ('%-' || auth.uid()::text)
  END
);

DROP POLICY IF EXISTS "Authenticated realtime send" ON realtime.messages;
CREATE POLICY "Authenticated realtime send"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'admin-rt-%' THEN has_role(auth.uid(), 'admin'::app_role)
    WHEN realtime.topic() LIKE 'space-%' THEN (
      has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
        SELECT 1 FROM public.community_spaces s
        WHERE s.id::text = SUBSTRING(realtime.topic() FROM 7)
          AND (s.course_id IS NULL OR public.is_enrolled(s.course_id, auth.uid()))
      )
    )
    ELSE realtime.topic() LIKE ('%-' || auth.uid()::text)
  END
);
