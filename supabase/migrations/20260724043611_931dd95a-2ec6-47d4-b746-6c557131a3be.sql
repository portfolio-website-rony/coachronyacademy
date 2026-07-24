
CREATE TABLE public.challenge_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_slug text NOT NULL DEFAULT 'success-code-30day',
  week_number int NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_slug, week_number)
);

GRANT SELECT ON public.challenge_weeks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_weeks TO authenticated;
GRANT ALL ON public.challenge_weeks TO service_role;
ALTER TABLE public.challenge_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view weeks" ON public.challenge_weeks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage weeks" ON public.challenge_weeks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_challenge_weeks_updated
  BEFORE UPDATE ON public.challenge_weeks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.challenge_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_slug text NOT NULL DEFAULT 'success-code-30day',
  day_number int NOT NULL,
  week_number int NOT NULL,
  title text NOT NULL,
  task text,
  content text,
  video_url text,
  unlock_offset_days int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_slug, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_days TO authenticated;
GRANT ALL ON public.challenge_days TO service_role;
ALTER TABLE public.challenge_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view days" ON public.challenge_days
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage days" ON public.challenge_days
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_challenge_days_updated
  BEFORE UPDATE ON public.challenge_days
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed weeks
INSERT INTO public.challenge_weeks (challenge_slug, week_number, title, description) VALUES
  ('success-code-30day', 1, 'Week 1 — Foundation', 'Mindset, goal-setting, discipline।'),
  ('success-code-30day', 2, 'Week 2 — Skill Discovery', 'নিজের skill খুঁজে বের করা।'),
  ('success-code-30day', 3, 'Week 3 — Action & Income', 'প্রথম টাকা income শুরু।'),
  ('success-code-30day', 4, 'Week 4 — Growth', 'Scale, brand, community।'),
  ('success-code-30day', 5, 'Final Push', 'Presentation & reward।');

-- Seed 30 days (mapped to weeks)
INSERT INTO public.challenge_days (challenge_slug, day_number, week_number, title, unlock_offset_days)
SELECT 'success-code-30day', d,
  CASE WHEN d <= 7 THEN 1 WHEN d <= 14 THEN 2 WHEN d <= 21 THEN 3 WHEN d <= 28 THEN 4 ELSE 5 END,
  'Day ' || d,
  d - 1
FROM generate_series(1, 30) d;
