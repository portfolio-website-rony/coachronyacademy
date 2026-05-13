
CREATE TABLE public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.lesson_notes
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_lesson_notes_updated BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lesson_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.lesson_bookmarks
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));

CREATE INDEX idx_lesson_bookmarks_user_lesson ON public.lesson_bookmarks(user_id, lesson_id);
