import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { BookOpen, Bell, Sparkles, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_student/student")({
  head: () => ({ meta: [{ title: "Student Dashboard — CoachRony" }] }),
  component: StudentOverview,
});

type Enr = {
  id: string;
  course_id: string;
  status: string;
  course: { id: string; title: string; slug: string; cover_url: string | null } | null;
  progress: number;
};

function StudentOverview() {
  const { profile, session } = useAuthUser();
  const [enrolled, setEnrolled] = useState<Enr[] | null>(null);
  const [notifs, setNotifs] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id,course_id,status,course:courses(id,title,slug,cover_url)")
        .eq("user_id", session.user.id);
      const enr = (data ?? []) as any[];
      const enriched: Enr[] = await Promise.all(
        enr.map(async (e) => {
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
          return { ...e, progress: total && total > 0 ? Math.round(((done ?? 0) / total) * 100) : 0 };
        })
      );
      setEnrolled(enriched);
    })();

    void supabase
      .from("notifications")
      .select("id,title,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setNotifs(data ?? []));
  }, [session]);

  const completed = (enrolled ?? []).filter((e) => e.status === "completed").length;
  const avg = enrolled && enrolled.length > 0
    ? Math.round(enrolled.reduce((a, e) => a + e.progress, 0) / enrolled.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Hi {profile?.display_name ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Continue your AI learning journey.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value={enrolled?.length ?? "…"} icon={BookOpen} hint="Courses" />
        <StatCard label="Avg progress" value={`${avg}%`} icon={GraduationCap} />
        <StatCard label="Completed" value={completed} icon={Sparkles} />
        <StatCard label="Notifications" value={notifs.length} icon={Bell} />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">My courses</h2>
          <Link to="/student/courses" className="text-xs text-primary-glow hover:underline">
            Browse catalog →
          </Link>
        </div>
        {enrolled === null ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-white/5" />
        ) : enrolled.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't enrolled in any courses yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {enrolled.map((e) => (
              <Link
                key={e.id}
                to="/student/courses/$slug"
                params={{ slug: e.course?.slug ?? "" }}
                className="group rounded-2xl border border-white/10 bg-background/40 p-4 transition hover:border-primary/40"
              >
                <div className="font-semibold group-hover:text-primary-glow">{e.course?.title}</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-primary" style={{ width: `${e.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{e.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Recent notifications</h2>
        <ul className="mt-3 divide-y divide-white/5">
          {notifs.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">No notifications yet.</li>
          )}
          {notifs.map((n) => (
            <li key={n.id} className="py-3 text-sm">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
