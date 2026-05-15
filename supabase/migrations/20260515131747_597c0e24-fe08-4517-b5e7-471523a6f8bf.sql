
-- Patch RLS gaps surfaced by security audit

-- 1) lesson_ai_queries: allow user to insert own query
DROP POLICY IF EXISTS "Users insert own ai query" ON public.lesson_ai_queries;
CREATE POLICY "Users insert own ai query"
ON public.lesson_ai_queries
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2) lesson_ai_summaries: only admins can write (system inserts via service role bypass RLS anyway)
DROP POLICY IF EXISTS "Admins insert summaries" ON public.lesson_ai_summaries;
CREATE POLICY "Admins insert summaries"
ON public.lesson_ai_summaries
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) notifications: tighten INSERT — users can only insert for themselves; system events should use service role
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins or self insert notifications"
ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR user_id = auth.uid()
);

-- 4) subscribers: prevent duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_unique
  ON public.subscribers (lower(email));

-- 5) Storage policies for cms-media (public read, admin write)
DROP POLICY IF EXISTS "cms-media public read" ON storage.objects;
CREATE POLICY "cms-media public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "cms-media admin write" ON storage.objects;
CREATE POLICY "cms-media admin write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "cms-media admin update" ON storage.objects;
CREATE POLICY "cms-media admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "cms-media admin delete" ON storage.objects;
CREATE POLICY "cms-media admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6) Storage policies for payment-screenshots (private)
-- Path convention: {auth.uid()}/{filename}
DROP POLICY IF EXISTS "payment-screenshots owner read" ON storage.objects;
CREATE POLICY "payment-screenshots owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "payment-screenshots owner upload" ON storage.objects;
CREATE POLICY "payment-screenshots owner upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "payment-screenshots admin manage" ON storage.objects;
CREATE POLICY "payment-screenshots admin manage"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
