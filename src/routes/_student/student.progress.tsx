import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export const Route = createFileRoute("/_student/student/progress")({
  head: () => ({ meta: [{ title: "Progress — CoachRony" }] }),
  component: ProgressPage,
});

type Item = {
  enrollmentId: string;
  courseTitle: string;
  total: number;
  done: number;
};

function ProgressPage() {
  const { session } = useAuthUser();
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("id,course_id,course:courses(title)")
        .eq("user_id", session.user.id);
      const enriched: Item[] = await Promise.all(
        ((enr ?? []) as any[]).map(async (e) => {
          const [{ count: total }, { count: done }] = await Promise.all([
            supabase
              .from("course_lessons")
              .select("id, course_modules!inner(course_id)", { count: "exact", head: true })
              .eq("course_modules.course_id", e.course_id),
            supabase
              .from("lesson_progress")
              .select("id", { count: "exact", head: true })
              .eq("enrollment_id", e.id)
              .not("completed_at", "is", null),
          ]);
          return {
            enrollmentId: e.id,
            courseTitle: e.course?.title ?? "Course",
            total: total ?? 0,
            done: done ?? 0,
          };
        })
      );
      setItems(enriched);
    })();
  }, [session]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Learning Progress</h1>
      {items === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No enrollments yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((i) => {
            const pct = i.total > 0 ? Math.round((i.done / i.total) * 100) : 0;
            return (
              <div key={i.enrollmentId} className="glass space-y-2 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{i.courseTitle}</span>
                  <span className="text-xs text-muted-foreground">{i.done}/{i.total} lessons · {pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
