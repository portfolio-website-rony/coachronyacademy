CREATE TABLE IF NOT EXISTS public._export_auth_users AS
SELECT id, email, phone, created_at, last_sign_in_at, email_confirmed_at,
       raw_user_meta_data, raw_app_meta_data
FROM auth.users;
GRANT SELECT ON public._export_auth_users TO authenticated, service_role;
ALTER TABLE public._export_auth_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read export" ON public._export_auth_users
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));