ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'recorded';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS live_schedule text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS live_join_url text;