
-- 1) Tighten community_comments INSERT with enrollment check
DROP POLICY IF EXISTS "Authed create comments" ON public.community_comments;
CREATE POLICY "Authed create comments" ON public.community_comments
FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_posts p
    JOIN public.community_spaces s ON s.id = p.space_id
    WHERE p.id = community_comments.post_id
      AND (s.course_id IS NULL
           OR public.is_enrolled(s.course_id, auth.uid())
           OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

-- 2) Tighten community_posts INSERT with same enrollment check
DROP POLICY IF EXISTS "Authed create posts" ON public.community_posts;
CREATE POLICY "Authed create posts" ON public.community_posts
FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_spaces s
    WHERE s.id = community_posts.space_id
      AND (s.course_id IS NULL
           OR public.is_enrolled(s.course_id, auth.uid())
           OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

-- 3) Restrict cms-media uploads to admins only (bucket is public)
DROP POLICY IF EXISTS "Users upload own media folder" ON storage.objects;
DROP POLICY IF EXISTS "Users update own media folder" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own media folder" ON storage.objects;

-- 4) Remove sensitive operational tables from realtime broadcasts
ALTER PUBLICATION supabase_realtime DROP TABLE public.leads;
ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;
ALTER PUBLICATION supabase_realtime DROP TABLE public.clients;
ALTER PUBLICATION supabase_realtime DROP TABLE public.lead_notes;
ALTER PUBLICATION supabase_realtime DROP TABLE public.payments;
ALTER PUBLICATION supabase_realtime DROP TABLE public.activity_log;
