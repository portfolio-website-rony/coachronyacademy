DROP POLICY IF EXISTS "Public read allowlisted site settings" ON public.cms_site_settings;
CREATE POLICY "Public read allowlisted site settings"
ON public.cms_site_settings
FOR SELECT
TO public
USING (key = ANY (ARRAY['contact'::text, 'work_experience'::text, 'homepage_media'::text]));