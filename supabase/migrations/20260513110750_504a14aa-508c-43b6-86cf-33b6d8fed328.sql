UPDATE public.courses
SET payment_methods_enabled = jsonb_build_object(
  'bkash', true,
  'nagad', true,
  'manual', true,
  'stripe', COALESCE((payment_methods_enabled->>'stripe')::boolean, false),
  'sslcommerz', COALESCE((payment_methods_enabled->>'sslcommerz')::boolean, false)
);

ALTER TABLE public.courses
  ALTER COLUMN payment_methods_enabled
  SET DEFAULT '{"bkash": true, "nagad": true, "manual": true, "stripe": false, "sslcommerz": false}'::jsonb;