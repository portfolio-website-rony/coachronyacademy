
-- Add booking fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rescheduled_from uuid,
  ADD COLUMN IF NOT EXISTS cancelled_reason text;

-- updated_at triggers on tables that have the column but no trigger
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','payments','cms_blog_posts','cms_portfolio',
    'cms_programs','cms_services','cms_testimonials','cms_site_settings','profiles'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END$$;

-- Notification fan-out helper
CREATE OR REPLACE FUNCTION public.notify_admins(_title text, _body text, _type text, _link text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, link)
  SELECT user_id, _title, _body, _type, _link
  FROM public.user_roles
  WHERE role = 'admin';
END;
$$;

-- Lead trigger
CREATE OR REPLACE FUNCTION public.on_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New lead: ' || NEW.name,
    COALESCE(NEW.email, NEW.phone, 'No contact info'),
    'lead',
    '/admin/leads'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_lead ON public.leads;
CREATE TRIGGER trg_on_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.on_new_lead();

-- Booking trigger
CREATE OR REPLACE FUNCTION public.on_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New booking: ' || NEW.name,
    'On ' || NEW.preferred_date::text || ' at ' || COALESCE(NEW.preferred_time, 'TBD'),
    'booking',
    '/admin/bookings'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_booking ON public.bookings;
CREATE TRIGGER trg_on_new_booking
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.on_new_booking();

-- Payment trigger
CREATE OR REPLACE FUNCTION public.on_new_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New payment: ' || NEW.amount::text || ' ' || NEW.currency,
    'Method: ' || NEW.method || ' · Status: ' || NEW.status,
    'payment',
    '/admin/payments'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_payment ON public.payments;
CREATE TRIGGER trg_on_new_payment
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.on_new_payment();

-- Realtime publication
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['leads','bookings','payments','notifications','lead_notes','clients']) LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
  END LOOP;
END$$;
