CREATE OR REPLACE FUNCTION public.auto_enroll_on_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _course_challenge_slug text;
BEGIN
  IF NEW.status IN ('verified','paid','succeeded')
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.user_id IS NOT NULL THEN

    IF NEW.course_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id, status)
      VALUES (NEW.user_id, NEW.course_id, 'active')
      ON CONFLICT (user_id, course_id) DO NOTHING;

      SELECT challenge_slug INTO _course_challenge_slug
      FROM public.courses WHERE id = NEW.course_id;

      IF _course_challenge_slug IS NOT NULL THEN
        INSERT INTO public.challenge_enrollments (user_id, challenge_slug)
        VALUES (NEW.user_id, _course_challenge_slug)
        ON CONFLICT (user_id, challenge_slug) DO NOTHING;
      END IF;
    END IF;

    IF NEW.challenge_slug IS NOT NULL THEN
      INSERT INTO public.challenge_enrollments (user_id, challenge_slug)
      VALUES (NEW.user_id, NEW.challenge_slug)
      ON CONFLICT (user_id, challenge_slug) DO NOTHING;
    END IF;

    IF NEW.coupon_id IS NOT NULL THEN
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
      INSERT INTO public.coupon_redemptions (coupon_id, user_id, payment_id)
      VALUES (NEW.coupon_id, NEW.user_id, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $function$;