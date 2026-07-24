
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL DEFAULT 'success-code-30day',
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_slug, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_progress TO authenticated;
GRANT ALL ON public.challenge_progress TO service_role;

ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own challenge progress"
ON public.challenge_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_challenge_progress_updated_at
BEFORE UPDATE ON public.challenge_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.challenge_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL DEFAULT 'success-code-30day',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_enrollments TO authenticated;
GRANT ALL ON public.challenge_enrollments TO service_role;

ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own challenge enrollment"
ON public.challenge_enrollments FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
