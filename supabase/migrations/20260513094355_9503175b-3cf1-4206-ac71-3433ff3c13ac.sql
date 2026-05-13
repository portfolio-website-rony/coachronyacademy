
-- Extend courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS promo_video_url text,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_price numeric,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BDT',
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'bn',
  ADD COLUMN IF NOT EXISTS instructor_name text,
  ADD COLUMN IF NOT EXISTS instructor_bio text,
  ADD COLUMN IF NOT EXISTS instructor_avatar_url text,
  ADD COLUMN IF NOT EXISTS learn_outcomes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS who_for text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS offer_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_methods_enabled jsonb NOT NULL DEFAULT
    '{"bkash":false,"nagad":false,"stripe":false,"sslcommerz":false,"manual":true}'::jsonb;

-- FAQs
CREATE TABLE IF NOT EXISTS public.course_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faqs of published" ON public.course_faqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_faqs.course_id AND c.published));
CREATE POLICY "Admins manage faqs" ON public.course_faqs FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Testimonials
CREATE TABLE IF NOT EXISTS public.course_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author text NOT NULL,
  role text,
  quote text NOT NULL,
  avatar_url text,
  rating integer NOT NULL DEFAULT 5,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials of published" ON public.course_testimonials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_testimonials.course_id AND c.published));
CREATE POLICY "Admins manage testimonials" ON public.course_testimonials FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'percent' CHECK (kind IN ('percent','flat')),
  value numeric NOT NULL CHECK (value >= 0),
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  payment_id uuid,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own redemptions" ON public.coupon_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Course views
CREATE TABLE IF NOT EXISTS public.course_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  referrer text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert view" ON public.course_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read views" ON public.course_views FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Extend payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gateway text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS gateway_ref text,
  ADD COLUMN IF NOT EXISTS gateway_payload jsonb;

-- Allow users to insert/read their own course payments
DROP POLICY IF EXISTS "Users insert own payment" ON public.payments;
CREATE POLICY "Users insert own payment" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users read own payment" ON public.payments;
CREATE POLICY "Users read own payment" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));

-- Enrollment uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique
  ON public.enrollments(user_id, course_id);

-- Auto-enroll trigger
CREATE OR REPLACE FUNCTION public.auto_enroll_on_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('verified','paid','succeeded')
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.course_id IS NOT NULL
     AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.enrollments (user_id, course_id, status)
    VALUES (NEW.user_id, NEW.course_id, 'active')
    ON CONFLICT (user_id, course_id) DO NOTHING;
    -- bump coupon usage
    IF NEW.coupon_id IS NOT NULL THEN
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
      INSERT INTO public.coupon_redemptions (coupon_id, user_id, payment_id)
      VALUES (NEW.coupon_id, NEW.user_id, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_enroll_on_payment ON public.payments;
CREATE TRIGGER trg_auto_enroll_on_payment
  AFTER UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_on_payment();

-- Coupon validation function
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _course_id uuid)
RETURNS TABLE (id uuid, kind text, value numeric, valid boolean, reason text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
