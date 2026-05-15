INSERT INTO public.cms_site_settings (key, value)
VALUES ('work_experience', jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('name', 'DBBL Bank', 'logo_url', ''),
  jsonb_build_object('name', 'Land Office', 'logo_url', ''),
  jsonb_build_object('name', 'Primary School', 'logo_url', ''),
  jsonb_build_object('name', 'High School', 'logo_url', ''),
  jsonb_build_object('name', 'Learning & Earning Project', 'logo_url', ''),
  jsonb_build_object('name', 'Mobile Banking', 'logo_url', ''),
  jsonb_build_object('name', 'Fiverr / Freelancer', 'logo_url', '')
)))
ON CONFLICT (key) DO NOTHING;