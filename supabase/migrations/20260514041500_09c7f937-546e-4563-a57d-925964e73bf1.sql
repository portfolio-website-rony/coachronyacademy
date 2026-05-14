
-- lesson_saves
CREATE TABLE public.lesson_saves (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
ALTER TABLE public.lesson_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.lesson_saves
  FOR ALL TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- profiles social_links
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Storage policies for cms-media: users can manage their own folder (e.g. avatars/{uid}/...)
CREATE POLICY "Users upload own media folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cms-media' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users update own media folder"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cms-media' AND auth.uid()::text = (storage.foldername(name))[2])
WITH CHECK (bucket_id = 'cms-media' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users delete own media folder"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cms-media' AND auth.uid()::text = (storage.foldername(name))[2]);
