
ALTER TABLE public.cms_portfolio
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS media_url text;

CREATE TABLE IF NOT EXISTS public.cms_page_banners (
  page text PRIMARY KEY,
  media_type text NOT NULL DEFAULT 'image',
  media_url text,
  title text,
  subtitle text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_page_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read banners"
  ON public.cms_page_banners FOR SELECT
  TO public USING (true);

CREATE POLICY "Admins manage banners"
  ON public.cms_page_banners FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_banners_updated_at
  BEFORE UPDATE ON public.cms_page_banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
