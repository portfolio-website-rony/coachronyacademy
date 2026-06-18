-- 1. cms_site_settings: switch to allowlist for public read
DROP POLICY IF EXISTS "Public read non-sensitive site settings" ON public.cms_site_settings;
CREATE POLICY "Public read allowlisted site settings"
  ON public.cms_site_settings
  FOR SELECT
  USING (key = ANY (ARRAY['contact','work_experience']));

-- 2. notifications: remove self-insert; only admins (and SECURITY DEFINER triggers) may insert
DROP POLICY IF EXISTS "Admins or self insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. realtime.messages: restrict send to topics owned by sender / admin / enrolled space
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
      ELSE POSITION((auth.uid())::text IN realtime.topic()) > 0
    END
  );