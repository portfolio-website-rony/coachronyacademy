import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { CheckCircle2, Circle, PlayCircle, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_student/student/courses/$slug/")({
  component: CoursePage,
});

type Course = { id: string; title: string; slug: string; description: string | null; cover_url: string | null };
type Module = { id: string; title: string; display_order: number };
type Lesson = { id: string; module_id: string; title: string; display_order: number; is_preview: boolean; duration_seconds: number };

function CoursePage() {
  const { slug } = Route.useParams();
  const { session } = useAuthUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    void (async () => {
      const { data: c } = await supabase
        .from("courses")
        .select("id,title,slug,description,cover_url")
        .eq("slug", slug)
        .maybeSingle();
      if (!c) return;
      setCourse(c as Course);
      const { data: m } = await supabase
        .from("course_modules")
        .select("id,title,display_order")
        .eq("course_id", c.id)
        .order("display_order");
      setModules((m as Module[]) ?? []);
      if (m && m.length > 0) {
        const { data: l } = await supabase
          .from("course_lessons")
          .select("id,module_id,title,display_order,is_preview,duration_seconds")
          .in("module_id", m.map((x: any) => x.id))
          .order("display_order");
        setLessons((l as Lesson[]) ?? []);
      }
      if (session) {
        const { data: e } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("course_id", c.id)
          .maybeSingle();
        if (e) {
          setEnrollmentId(e.id);
          const { data: lp } = await supabase
            .from("lesson_progress")
            .select("lesson_id,completed_at")
            .eq("enrollment_id", e.id);
          setCompleted(new Set((lp ?? []).filter((x: any) => x.completed_at).map((x: any) => x.lesson_id)));
        }
      }
    })();
  }, [slug, session]);

  async function enroll() {
    if (!session || !course) return;
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ course_id: course.id, user_id: session.user.id })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    setEnrollmentId(data.id);
    toast.success("Enrolled!");
  }

  if (!course) return <div className="glass h-40 animate-pulse rounded-2xl" />;
  const firstLesson = lessons[0];

  return (
    <div className="space-y-6">
      <div className="glass overflow-hidden rounded-2xl">
        <div className="aspect-[3/1] bg-gradient-primary/30">
          {course.cover_url && <img src={course.cover_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-3 p-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{course.title}</h1>
          {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
          <div className="flex gap-2">
            {!enrollmentId ? (
              <button onClick={enroll} className="rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-background shadow-glow">
                Enroll free
              </button>
            ) : firstLesson ? (
              <button
                onClick={() =>
                  navigate({
                    to: "/student/courses/$slug/$lessonId",
                    params: { slug, lessonId: firstLesson.id },
                  })
                }
                className="rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-background shadow-glow"
              >
                Continue learning →
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">Curriculum</h2>
        {modules.map((m) => (
          <div key={m.id} className="glass rounded-2xl p-4">
            <h3 className="font-semibold">{m.title}</h3>
            <ul className="mt-3 divide-y divide-white/5">
              {lessons.filter((l) => l.module_id === m.id).map((l) => {
                const accessible = enrollmentId || l.is_preview;
                const done = completed.has(l.id);
                return (
                  <li key={l.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary-glow" />
                      ) : accessible ? (
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{l.title}</span>
                      {l.is_preview && !enrollmentId && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-glow">
                          Preview
                        </span>
                      )}
                    </div>
                    {accessible ? (
                      <Link
                        to="/student/courses/$slug/$lessonId"
                        params={{ slug, lessonId: l.id }}
                        className="text-xs text-primary-glow hover:underline"
                      >
                        Watch →
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Enroll to access</span>
                    )}
                  </li>
                );
              })}
              {lessons.filter((l) => l.module_id === m.id).length === 0 && (
                <li className="py-2 text-sm text-muted-foreground">No lessons yet.</li>
              )}
            </ul>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No modules yet.</div>
        )}
      </div>
    </div>
  );
}
