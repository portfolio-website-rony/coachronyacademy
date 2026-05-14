import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, PlayCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";

export const Route = createFileRoute("/_student/student/saved")({
  head: () => ({ meta: [{ title: "Saved Lessons — CoachRony" }] }),
  component: SavedPage,
});

type SavedRow = {
  lesson_id: string;
  created_at: string;
  lesson: {
    id: string;
    title: string;
    duration_seconds: number;
    module: { course: { slug: string; title: string; cover_url: string | null } } | null;
  } | null;
};

function SavedPage() {
  const { session } = useAuthUser();
  const [items, setItems] = useState<SavedRow[] | null>(null);

  async function load() {
    if (!session) return;
    const { data } = await supabase
      .from("lesson_saves")
      .select(
        "lesson_id, created_at, lesson:course_lessons(id,title,duration_seconds, module:course_modules(course:courses(slug,title,cover_url)))",
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as SavedRow[]) ?? []);
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [session]);

  async function unsave(lessonId: string) {
    if (!session) return;
    const { error } = await supabase.from("lesson_saves").delete().eq("user_id", session.user.id).eq("lesson_id", lessonId);
    if (error) return toast.error(error.message);
    setItems((prev) => (prev ?? []).filter((i) => i.lesson_id !== lessonId));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Saved Lessons</h1>

      {items === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : items.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No saved lessons yet. Tap Save on any lesson to keep it here.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((row) => {
            const course = row.lesson?.module?.course;
            if (!row.lesson || !course) return null;
            return (
              <div key={row.lesson_id} className="glass flex gap-3 rounded-2xl p-3">
                <div className="aspect-video h-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {course.cover_url && <img src={course.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground line-clamp-1">{course.title}</div>
                  <div className="text-sm font-semibold line-clamp-2">{row.lesson.title}</div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Link
                      to="/student/courses/$slug/$lessonId"
                      params={{ slug: course.slug, lessonId: row.lesson_id }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-background"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Resume
                    </Link>
                    <button
                      onClick={() => unsave(row.lesson_id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
