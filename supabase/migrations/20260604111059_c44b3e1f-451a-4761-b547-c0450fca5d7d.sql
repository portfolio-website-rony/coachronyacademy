
DROP POLICY IF EXISTS "Public read site settings" ON public.cms_site_settings;
CREATE POLICY "Public read non-sensitive site settings"
  ON public.cms_site_settings
  FOR SELECT
  TO anon, authenticated
  USING (key <> 'payments');

CREATE POLICY "Authenticated read payment settings"
  ON public.cms_site_settings
  FOR SELECT
  TO authenticated
  USING (key = 'payments');

DROP POLICY IF EXISTS "Read likes" ON public.community_likes;
CREATE POLICY "Read likes on accessible posts"
  ON public.community_likes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_posts p
      JOIN public.community_spaces s ON s.id = p.space_id
      WHERE p.id = community_likes.post_id
        AND (
          s.course_id IS NULL
          OR public.is_enrolled(s.course_id, auth.uid())
          OR public.has_role(auth.uid(), 'admin'::public.app_role)
        )
    )
  );

DROP POLICY IF EXISTS "Authenticated realtime receive" ON realtime.messages;
CREATE POLICY "Authenticated realtime receive"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN realtime.topic() LIKE 'admin-rt-%' THEN public.has_role(auth.uid(), 'admin'::public.app_role)
      WHEN realtime.topic() LIKE 'space-%' THEN true
      ELSE position(auth.uid()::text in realtime.topic()) > 0
    END
  );
