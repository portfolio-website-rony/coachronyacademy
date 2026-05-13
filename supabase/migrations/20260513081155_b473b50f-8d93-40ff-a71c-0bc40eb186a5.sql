
-- =========================================================
-- LMS CORE
-- =========================================================

-- Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  level text NOT NULL DEFAULT 'beginner',
  category text,
  published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  instructor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_course_modules_course ON public.course_modules(course_id);

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  youtube_url text,
  duration_seconds int NOT NULL DEFAULT 0,
  display_order int NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id);

-- Enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (course_id, user_id)
);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);

-- Lesson progress
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  watched_seconds int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, lesson_id)
);
CREATE INDEX idx_lp_enrollment ON public.lesson_progress(enrollment_id);

-- Community
CREATE TABLE public.community_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.community_spaces(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  like_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_space ON public.community_posts(space_id, created_at DESC);

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post ON public.community_comments(post_id, created_at);

CREATE TABLE public.community_likes (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- =========================================================
-- updated_at triggers
-- =========================================================
CREATE TRIGGER courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER posts_updated BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user enrolled in a course?
CREATE OR REPLACE FUNCTION public.is_enrolled(_course_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE course_id = _course_id AND user_id = _user_id
  )
$$;

-- Courses
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Public read published courses" ON public.courses FOR SELECT TO public
  USING (published = true);

-- Modules
CREATE POLICY "Admins manage modules" ON public.course_modules FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Public read modules of published" ON public.course_modules FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published));

-- Lessons (note: full youtube_url visible to all; if needed we can scope later)
CREATE POLICY "Admins manage lessons" ON public.course_lessons FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Read lessons of published" ON public.course_lessons FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.published
  ));

-- Enrollments
CREATE POLICY "Users read own enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own enrollment" ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own enrollment" ON public.enrollments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete enrollments" ON public.enrollments FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Lesson progress
CREATE POLICY "Users manage own progress" ON public.lesson_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_id AND (e.user_id = auth.uid() OR has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_id AND e.user_id = auth.uid()));

-- Community spaces
CREATE POLICY "Admins manage spaces" ON public.community_spaces FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Read accessible spaces" ON public.community_spaces FOR SELECT TO authenticated
  USING (course_id IS NULL OR is_enrolled(course_id, auth.uid()) OR has_role(auth.uid(),'admin'));

-- Community posts
CREATE POLICY "Read posts in accessible spaces" ON public.community_posts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_spaces s
    WHERE s.id = space_id AND (s.course_id IS NULL OR is_enrolled(s.course_id, auth.uid()) OR has_role(auth.uid(),'admin'))
  ));
CREATE POLICY "Authed create posts" ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.community_spaces s
      WHERE s.id = space_id AND (s.course_id IS NULL OR is_enrolled(s.course_id, auth.uid()) OR has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "Edit own or admin posts" ON public.community_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (author_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Delete own or admin posts" ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'));

-- Community comments
CREATE POLICY "Read comments on accessible posts" ON public.community_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_posts p
    JOIN public.community_spaces s ON s.id = p.space_id
    WHERE p.id = post_id AND (s.course_id IS NULL OR is_enrolled(s.course_id, auth.uid()) OR has_role(auth.uid(),'admin'))
  ));
CREATE POLICY "Authed create comments" ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Edit own comments" ON public.community_comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (author_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Delete own comments" ON public.community_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'));

-- Likes
CREATE POLICY "Read likes" ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Like own" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Unlike own" ON public.community_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =========================================================
-- Counters & completion triggers
-- =========================================================
CREATE OR REPLACE FUNCTION public.bump_post_likes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_likes_count AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_post_likes();

CREATE OR REPLACE FUNCTION public.bump_post_comments() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_comments_count AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.bump_post_comments();

-- Auto-complete enrollment when all lessons done
CREATE OR REPLACE FUNCTION public.maybe_complete_enrollment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  total int;
  done int;
  c_id uuid;
BEGIN
  SELECT e.course_id INTO c_id FROM public.enrollments e WHERE e.id = NEW.enrollment_id;
  SELECT count(*) INTO total FROM public.course_lessons l
    JOIN public.course_modules m ON m.id = l.module_id WHERE m.course_id = c_id;
  SELECT count(*) INTO done FROM public.lesson_progress lp
    JOIN public.course_lessons l ON l.id = lp.lesson_id
    JOIN public.course_modules m ON m.id = l.module_id
    WHERE lp.enrollment_id = NEW.enrollment_id AND m.course_id = c_id AND lp.completed_at IS NOT NULL;
  IF total > 0 AND done >= total THEN
    UPDATE public.enrollments SET status = 'completed', completed_at = now()
      WHERE id = NEW.enrollment_id AND completed_at IS NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_progress_complete AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.maybe_complete_enrollment();

-- Notifications
CREATE OR REPLACE FUNCTION public.on_new_enrollment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c_title text;
BEGIN
  SELECT title INTO c_title FROM public.courses WHERE id = NEW.course_id;
  PERFORM public.notify_admins(
    'New enrollment: ' || COALESCE(c_title,'a course'),
    'A student enrolled.',
    'enrollment',
    '/admin/students'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_new_enrollment AFTER INSERT ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.on_new_enrollment();

CREATE OR REPLACE FUNCTION public.on_new_comment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE author uuid;
BEGIN
  SELECT author_id INTO author FROM public.community_posts WHERE id = NEW.post_id;
  IF author IS NOT NULL AND author <> NEW.author_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (author, 'New comment on your post', LEFT(NEW.body, 140), 'comment', '/student/community');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_new_comment AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.on_new_comment();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;

-- Seed default global space
INSERT INTO public.community_spaces (name, slug, description, display_order)
VALUES ('General', 'general', 'Welcome to the community.', 0)
ON CONFLICT (slug) DO NOTHING;
