
-- ============================================================
-- Migration: clear all 24 Supabase linter warnings
-- ============================================================

-- 1) Private schema for SECURITY DEFINER logic
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- 2) Move helper logic to private (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.is_enrolled(_course_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = _course_id AND user_id = _user_id) $$;

CREATE OR REPLACE FUNCTION private.validate_coupon(_code text, _course_id uuid)
RETURNS TABLE(id uuid, kind text, value numeric, valid boolean, reason text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE r record;
BEGIN
  SELECT * INTO r FROM public.coupons WHERE code = _code LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, false, 'not_found'::text; RETURN;
  END IF;
  IF NOT r.active THEN
    RETURN QUERY SELECT r.id, r.kind, r.value, false, 'inactive'::text; RETURN;
  END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at < now() THEN
    RETURN QUERY SELECT r.id, r.kind, r.value, false, 'expired'::text; RETURN;
  END IF;
  IF r.max_uses IS NOT NULL AND r.used_count >= r.max_uses THEN
    RETURN QUERY SELECT r.id, r.kind, r.value, false, 'max_uses'::text; RETURN;
  END IF;
  IF r.course_id IS NOT NULL AND r.course_id <> _course_id THEN
    RETURN QUERY SELECT r.id, r.kind, r.value, false, 'wrong_course'::text; RETURN;
  END IF;
  RETURN QUERY SELECT r.id, r.kind, r.value, true, 'ok'::text;
END $$;

-- Lock down private functions: revoke from PUBLIC, grant only to roles that need them
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_enrolled(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.validate_coupon(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_enrolled(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.validate_coupon(text, uuid) TO authenticated;

-- 3) Replace public.has_role / is_enrolled / validate_coupon with SECURITY INVOKER wrappers
--    (Keep same signatures so existing RLS policies and RPC calls keep working.)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT private.has_role(_user_id, _role) $$;

CREATE OR REPLACE FUNCTION public.is_enrolled(_course_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT private.is_enrolled(_course_id, _user_id) $$;

CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _course_id uuid)
RETURNS TABLE(id uuid, kind text, value numeric, valid boolean, reason text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT * FROM private.validate_coupon(_code, _course_id) $$;

-- 4) Lock down all remaining public SECURITY DEFINER functions (trigger-only helpers).
--    Triggers run as the table owner and do NOT require EXECUTE for the calling role.
REVOKE EXECUTE ON FUNCTION public.set_updated_at()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_new_comment()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_new_booking()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_new_payment()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_new_enrollment()               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_new_lead()                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_post_likes()                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_post_comments()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.maybe_complete_enrollment()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_enroll_on_payment()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admins(text, text, text, text) FROM PUBLIC, anon, authenticated;

-- 5) Drop overly broad public listing policy on cms-media bucket.
--    Public buckets serve individual files via CDN URLs without a SELECT policy.
DROP POLICY IF EXISTS "cms-media public read" ON storage.objects;

-- 6) Tighten four "always true" INSERT policies with basic validation
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking" ON public.bookings
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(btrim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(coalesce(phone,'')) <= 50
  AND char_length(coalesce(topic,'')) <= 500
  AND char_length(coalesce(notes,'')) <= 5000
  AND preferred_date >= (current_date - interval '1 day')
  AND char_length(btrim(preferred_time)) BETWEEN 1 AND 50
);

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  AND char_length(coalesce(email,'')) <= 255
  AND char_length(coalesce(phone,'')) <= 50
  AND char_length(coalesce(interest,'')) <= 500
  AND char_length(coalesce(message,'')) <= 5000
);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe" ON public.subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(email) <= 255
  AND char_length(coalesce(tag,'')) <= 100
);

DROP POLICY IF EXISTS "Anyone insert view" ON public.course_views;
CREATE POLICY "Anyone insert view" ON public.course_views
FOR INSERT TO anon, authenticated
WITH CHECK (
  course_id IS NOT NULL
  AND char_length(coalesce(session_id,'')) <= 200
  AND char_length(coalesce(referrer,'')) <= 500
);
