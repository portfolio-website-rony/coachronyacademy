-- AUTH
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- NOTIFICATIONS
DROP TRIGGER IF EXISTS trg_on_new_lead ON public.leads;
CREATE TRIGGER trg_on_new_lead AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.on_new_lead();

DROP TRIGGER IF EXISTS trg_on_new_booking ON public.bookings;
CREATE TRIGGER trg_on_new_booking AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.on_new_booking();

DROP TRIGGER IF EXISTS trg_on_new_payment ON public.payments;
CREATE TRIGGER trg_on_new_payment AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.on_new_payment();

DROP TRIGGER IF EXISTS trg_on_new_enrollment ON public.enrollments;
CREATE TRIGGER trg_on_new_enrollment AFTER INSERT ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.on_new_enrollment();

DROP TRIGGER IF EXISTS trg_on_new_comment ON public.community_comments;
CREATE TRIGGER trg_on_new_comment AFTER INSERT ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.on_new_comment();

-- COUNTERS
DROP TRIGGER IF EXISTS trg_bump_post_comments ON public.community_comments;
CREATE TRIGGER trg_bump_post_comments AFTER INSERT OR DELETE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.bump_post_comments();

DROP TRIGGER IF EXISTS trg_bump_post_likes ON public.community_likes;
CREATE TRIGGER trg_bump_post_likes AFTER INSERT OR DELETE ON public.community_likes FOR EACH ROW EXECUTE FUNCTION public.bump_post_likes();

-- ENROLLMENT AUTOMATION
DROP TRIGGER IF EXISTS trg_maybe_complete_enrollment ON public.lesson_progress;
CREATE TRIGGER trg_maybe_complete_enrollment AFTER INSERT OR UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.maybe_complete_enrollment();

DROP TRIGGER IF EXISTS trg_auto_enroll_on_payment ON public.payments;
CREATE TRIGGER trg_auto_enroll_on_payment AFTER UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_on_payment();

-- UPDATED_AT
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_clients ON public.clients;
CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_courses ON public.courses;
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON public.payments;
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_site_settings ON public.cms_site_settings;
CREATE TRIGGER set_updated_at_cms_site_settings BEFORE UPDATE ON public.cms_site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_blog_posts ON public.cms_blog_posts;
CREATE TRIGGER set_updated_at_cms_blog_posts BEFORE UPDATE ON public.cms_blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_services ON public.cms_services;
CREATE TRIGGER set_updated_at_cms_services BEFORE UPDATE ON public.cms_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_programs ON public.cms_programs;
CREATE TRIGGER set_updated_at_cms_programs BEFORE UPDATE ON public.cms_programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_portfolio ON public.cms_portfolio;
CREATE TRIGGER set_updated_at_cms_portfolio BEFORE UPDATE ON public.cms_portfolio FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_testimonials ON public.cms_testimonials;
CREATE TRIGGER set_updated_at_cms_testimonials BEFORE UPDATE ON public.cms_testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cms_page_banners ON public.cms_page_banners;
CREATE TRIGGER set_updated_at_cms_page_banners BEFORE UPDATE ON public.cms_page_banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_community_posts ON public.community_posts;
CREATE TRIGGER set_updated_at_community_posts BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_lesson_notes ON public.lesson_notes;
CREATE TRIGGER set_updated_at_lesson_notes BEFORE UPDATE ON public.lesson_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();