
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS challenge_slug text;

CREATE OR REPLACE FUNCTION public.auto_enroll_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IN ('verified','paid','succeeded')
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.user_id IS NOT NULL THEN

    -- Course auto-enroll
    IF NEW.course_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id, status)
      VALUES (NEW.user_id, NEW.course_id, 'active')
      ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;

    -- Challenge auto-enroll
    IF NEW.challenge_slug IS NOT NULL THEN
      INSERT INTO public.challenge_enrollments (user_id, challenge_slug)
      VALUES (NEW.user_id, NEW.challenge_slug)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Coupon usage bump (unchanged)
    IF NEW.coupon_id IS NOT NULL THEN
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
      INSERT INTO public.coupon_redemptions (coupon_id, user_id, payment_id)
      VALUES (NEW.coupon_id, NEW.user_id, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $function$;
