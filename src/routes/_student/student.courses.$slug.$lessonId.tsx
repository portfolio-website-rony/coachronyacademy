import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { YouTubePlayer } from "@/components/learn/YouTubePlayer";
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_student/student/courses/$slug/$lessonId")({
  component: LessonPage,
});

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  duration_seconds: number;
  display_order: number;
  is_preview: boolean;
};

function LessonPage() {
  const { slug, lessonId } = Route.useParams();
  const { session } = useAuthUser();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [startAt, setStartAt] = useState(0);
  const [duration, setDuration] = useState(0);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    void (async () => {
      const { data: c } = await supabase.from("courses").select("id").eq("slug", slug).maybeSingle();
      if (!c) return;
      const { data: m } = await supabase.from("course_modules").select("id,display_order").eq("course_id", c.id).order("display_order");
      const moduleIds = (m ?? []).map((x: any) => x.id);
      if (moduleIds.length === 0) return;
      const { data: l } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("display_order");
      const lessonsList = (l as Lesson[]) ?? [];
      // sort by module then display_order
      const orderMap = new Map((m ?? []).map((mm: any) => [mm.id, mm.display_order]));
      lessonsList.sort((a, b) => {
        const moa = orderMap.get(a.module_id) ?? 0;
        const mob = orderMap.get(b.module_id) ?? 0;
        if (moa !== mob) return moa - mob;
        return a.display_order - b.display_order;
      });
      setAllLessons(lessonsList);
      const cur = lessonsList.find((x) => x.id === lessonId) ?? null;
      setLesson(cur);

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
            .select("watched_seconds,completed_at")
            .eq("enrollment_id", e.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();
          if (lp) {
            setStartAt(lp.watched_seconds ?? 0);
            setDone(!!lp.completed_at);
            completedRef.current = !!lp.completed_at;
          } else {
            setStartAt(0);
            setDone(false);
            completedRef.current = false;
          }
        }
      }
    })();
  }, [slug, lessonId, session]);

  async function saveProgress(seconds: number, total: number) {
    if (!enrollmentId || !lesson) return;
    const dur = total > 0 ? total : lesson.duration_seconds;
    const isComplete = dur > 0 && seconds / dur >= 0.9;
    await supabase.from("lesson_progress").upsert(
      {
        enrollment_id: enrollmentId,
        lesson_id: lesson.id,
        watched_seconds: Math.floor(seconds),
        last_watched_at: new Date().toISOString(),
        completed_at: isComplete || completedRef.current ? new Date().toISOString() : null,
      },
      { onConflict: "enrollment_id,lesson_id" }
    );
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      setDone(true);
      toast.success("Lesson complete!");
    }
  }

  if (!lesson) return <div className="glass h-40 animate-pulse rounded-2xl" />;

  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  const accessible = !!enrollmentId || lesson.is_preview;

  return (
    <div className="space-y-4">
      <Link to="/student/courses/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      {!accessible ? (
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl font-bold">Enroll to access this lesson</h2>
        </div>
      ) : (
        <YouTubePlayer
          url={lesson.youtube_url ?? ""}
          startAt={startAt}
          onProgress={(s) => saveProgress(s, duration)}
          onDuration={(d) => setDuration(d)}
        />
      )}

      <div className="glass space-y-3 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">{lesson.title}</h1>
            {lesson.description && <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>}
          </div>
          {done && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs text-primary-glow">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
        <div className="flex justify-between gap-3 pt-2">
          <button
            disabled={!prev}
            onClick={() => prev && navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: prev.id } })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            disabled={!next}
            onClick={() => next && navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: next.id } })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-sm font-semibold text-background disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
