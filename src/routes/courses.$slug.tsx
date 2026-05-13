import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { formatPrice, formatDuration, youtubeEmbedUrl } from "@/lib/format";
import { CountdownTimer } from "@/components/learn/CountdownTimer";
import {
  Check, Play, Clock, BarChart3, Globe, GraduationCap, Star,
  ChevronDown, Sparkles, Users, Award, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course — ${params.slug}` },
      { name: "description", content: "AI course by CoachRony — enroll now and start learning." },
    ],
  }),
  component: CourseSalesPage,
});

type Course = {
  id: string; title: string; slug: string; tagline: string | null; description: string | null;
  long_description: string | null; cover_url: string | null; promo_video_url: string | null;
  level: string; category: string | null; language: string; duration_minutes: number;
  price: number; discount_price: number | null; currency: string;
  instructor_name: string | null; instructor_bio: string | null; instructor_avatar_url: string | null;
  learn_outcomes: string[]; who_for: string[]; requirements: string[];
  offer_ends_at: string | null;
  payment_methods_enabled: Record<string, boolean>;
  published: boolean;
};
type Module = { id: string; title: string; display_order: number };
type Lesson = { id: string; module_id: string; title: string; duration_seconds: number; is_preview: boolean; display_order: number };
type Faq = { id: string; question: string; answer: string };
type Testimonial = { id: string; author: string; role: string | null; quote: string; rating: number; avatar_url: string | null };

function CourseSalesPage() {
  const { slug } = Route.useParams();
  const { session } = useAuthUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: c } = await supabase
        .from("courses").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (cancelled) return;
      if (!c) { setLoading(false); return; }
      const course = c as unknown as Course;
      setCourse(course);
      const [{ data: m }, { data: f }, { data: t }] = await Promise.all([
        supabase.from("course_modules").select("*").eq("course_id", course.id).order("display_order"),
        supabase.from("course_faqs").select("*").eq("course_id", course.id).order("display_order"),
        supabase.from("course_testimonials").select("*").eq("course_id", course.id).order("display_order"),
      ]);
      setModules((m as Module[]) ?? []);
      setFaqs((f as Faq[]) ?? []);
      setTestimonials((t as Testimonial[]) ?? []);
      if (m && m.length) {
        const { data: l } = await supabase.from("course_lessons")
          .select("id,module_id,title,duration_seconds,is_preview,display_order")
          .in("module_id", m.map((x: any) => x.id)).order("display_order");
        setLessons((l as Lesson[]) ?? []);
      }
      if (session) {
        const { data: e } = await supabase.from("enrollments")
          .select("id").eq("course_id", course.id).eq("user_id", session.user.id).maybeSingle();
        setEnrolled(!!e);
      }
      // fire and forget view tracking
      supabase.from("course_views").insert({
        course_id: course.id,
        user_id: session?.user.id ?? null,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      }).then(() => {});
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, session]);

  if (loading) return <div className="container mx-auto max-w-6xl px-4 py-20"><div className="glass h-96 animate-pulse rounded-3xl" /></div>;
  if (!course) return (
    <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Course not found</h1>
      <p className="mt-3 text-muted-foreground">এই course টি available নেই।</p>
      <Link to="/programs" className="mt-6 inline-block rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background">Browse all programs</Link>
    </div>
  );

  const finalPrice = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price !== null && course.discount_price < course.price;
  const isFree = finalPrice === 0;
  const totalLessons = lessons.length;
  const promoEmbed = youtubeEmbedUrl(course.promo_video_url);

  function onEnroll() {
    if (enrolled) {
      navigate({ to: "/student/courses/$slug", params: { slug: course!.slug } });
      return;
    }
    if (!session) {
      navigate({ to: "/login", search: { returnTo: `/courses/${course!.slug}/checkout` } as any });
      return;
    }
    navigate({ to: "/courses/$slug/checkout", params: { slug: course!.slug } });
  }

  return (
    <div className="relative pb-32">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow">
                <Sparkles className="h-3 w-3" /> {course.category ?? "AI Course"}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-muted-foreground">{course.level}</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {course.title}
            </h1>
            {course.tagline && (
              <p className="text-lg text-muted-foreground sm:text-xl">{course.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)}</span>
              <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> {course.level}</span>
              <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4" /> {course.language === "bn" ? "Bangla" : "English"}</span>
              {totalLessons > 0 && <span className="inline-flex items-center gap-1.5"><Play className="h-4 w-4" /> {totalLessons} lessons</span>}
            </div>
            {course.offer_ends_at && new Date(course.offer_ends_at) > new Date() && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">⚡ Limited time offer ends in</p>
                <CountdownTimer endsAt={course.offer_ends_at} />
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={onEnroll} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-base font-semibold text-background shadow-glow">
                {enrolled ? "Continue learning →" : isFree ? "Enroll free" : `Enroll for ${formatPrice(finalPrice, course.currency)}`}
              </button>
              {promoEmbed && (
                <a href="#promo" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-base font-semibold hover:bg-white/5">
                  <Play className="h-4 w-4" /> Watch promo
                </a>
              )}
            </div>
          </div>

          {/* Promo media */}
          <div id="promo" className="glass relative overflow-hidden rounded-3xl">
            {promoEmbed ? (
              <div className="aspect-video">
                <iframe src={promoEmbed} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : course.cover_url ? (
              <img src={course.cover_url} alt={course.title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center bg-gradient-to-br from-primary/30 to-fuchsia-500/20">
                <GraduationCap className="h-20 w-20 text-primary-glow/60" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_360px]">
        <main className="space-y-12">
          {/* Long description */}
          {course.long_description && (
            <Section title="About this course">
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">{course.long_description}</p>
            </Section>
          )}

          {/* Learn outcomes */}
          {course.learn_outcomes.length > 0 && (
            <Section title="What you'll learn">
              <div className="grid gap-3 sm:grid-cols-2">
                {course.learn_outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20"><Check className="h-3.5 w-3.5 text-primary-glow" /></div>
                    <span className="text-sm">{o}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Curriculum */}
          {modules.length > 0 && (
            <Section title="Course curriculum" subtitle={`${modules.length} modules · ${totalLessons} lessons`}>
              <div className="space-y-3">
                {modules.map((m, idx) => (
                  <ModuleAccordion
                    key={m.id}
                    index={idx + 1}
                    module={m}
                    lessons={lessons.filter((l) => l.module_id === m.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Who for + Requirements */}
          {(course.who_for.length > 0 || course.requirements.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {course.who_for.length > 0 && (
                <Section title="Who this is for">
                  <ul className="space-y-2 text-sm">
                    {course.who_for.map((w, i) => (
                      <li key={i} className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" /> {w}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {course.requirements.length > 0 && (
                <Section title="Requirements">
                  <ul className="space-y-2 text-sm">
                    {course.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" /> {r}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}

          {/* Instructor */}
          {course.instructor_name && (
            <Section title="Your instructor">
              <div className="glass flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-primary/20">
                  {course.instructor_avatar_url ? (
                    <img src={course.instructor_avatar_url} alt={course.instructor_name} className="h-full w-full object-cover" />
                  ) : <Award className="h-10 w-10 text-primary-glow" />}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{course.instructor_name}</h3>
                  {course.instructor_bio && <p className="mt-1 text-sm text-muted-foreground">{course.instructor_bio}</p>}
                </div>
              </div>
            </Section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <Section title="Student reviews">
              <div className="grid gap-4 md:grid-cols-2">
                {testimonials.map((t) => (
                  <div key={t.id} className="glass rounded-2xl p-5">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">"{t.quote}"</p>
                    <div className="mt-4 text-xs">
                      <div className="font-semibold">{t.author}</div>
                      {t.role && <div className="text-muted-foreground">{t.role}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <Section title="Frequently asked questions">
              <div className="space-y-2">
                {faqs.map((f) => <FaqItem key={f.id} faq={f} />)}
              </div>
            </Section>
          )}

          {/* Final CTA */}
          <div className="glass overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 to-fuchsia-500/10 p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to start?</h2>
            <p className="mt-2 text-muted-foreground">আজই enroll করুন — lifetime access।</p>
            <button onClick={onEnroll} className="mt-6 inline-flex rounded-xl bg-gradient-primary px-6 py-3 text-base font-semibold text-background shadow-glow">
              {enrolled ? "Continue learning →" : isFree ? "Enroll free" : `Enroll for ${formatPrice(finalPrice, course.currency)}`}
            </button>
          </div>
        </main>

        {/* Sticky pricing card */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="glass space-y-5 rounded-3xl p-6">
            {course.cover_url && (
              <img src={course.cover_url} alt="" className="aspect-video w-full rounded-xl object-cover" />
            )}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-gradient">{formatPrice(finalPrice, course.currency)}</span>
                {hasDiscount && <span className="text-base text-muted-foreground line-through">{formatPrice(course.price, course.currency)}</span>}
              </div>
              {hasDiscount && (
                <div className="mt-1 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  Save {Math.round(((course.price - (course.discount_price ?? 0)) / course.price) * 100)}%
                </div>
              )}
            </div>
            <button onClick={onEnroll} className="w-full rounded-xl bg-gradient-primary px-5 py-3 text-base font-semibold text-background shadow-glow">
              {enrolled ? "Continue learning →" : isFree ? "Enroll free" : "Enroll Now"}
            </button>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary-glow" /> Lifetime access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary-glow" /> Community support</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary-glow" /> Certificate of completion</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary-glow" /> Mobile + desktop friendly</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{hasDiscount && <span className="line-through">{formatPrice(course.price, course.currency)}</span>}</div>
            <div className="font-display text-xl font-bold text-gradient">{formatPrice(finalPrice, course.currency)}</div>
          </div>
          <button onClick={onEnroll} className="flex-1 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-background shadow-glow">
            {enrolled ? "Continue →" : isFree ? "Enroll free" : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function ModuleAccordion({ index, module: m, lessons }: { index: number; module: Module; lessons: Lesson[] }) {
  const [open, setOpen] = useState(index === 1);
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary-glow">{index}</span>
          <div>
            <div className="font-semibold">{m.title}</div>
            <div className="text-xs text-muted-foreground">{lessons.length} lessons</div>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && lessons.length > 0 && (
        <ul className="divide-y divide-white/5 border-t border-white/5">
          {lessons.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-3 truncate">
                <Play className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{l.title}</span>
                {l.is_preview && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary-glow">Preview</span>}
              </div>
              {l.duration_seconds > 0 && <span className="shrink-0 text-xs text-muted-foreground">{Math.ceil(l.duration_seconds / 60)} min</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.03]">
        <span className="font-medium">{faq.question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-white/5 p-4 text-sm text-muted-foreground">{faq.answer}</div>}
    </div>
  );
}
