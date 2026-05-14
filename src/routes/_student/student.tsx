import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { BookOpen, Bell, Sparkles, GraduationCap, Clock, Flame, PlayCircle, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_student/student")({
  head: () => ({ meta: [{ title: "Dashboard — CoachRony" }] }),
  component: StudentOverview,
});

type Enrollment = {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  course: { id: string; title: string; slug: string; cover_url: string | null } | null;
};

type EnrichedEnrollment = Enrollment & {
  total: number;
  done: number;
  progress: number;
  lastLessonId: string | null;
  lastWatchedAt: string | null;
  totalSeconds: number;
};

type Notif = { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string };

function StudentOverview() {
  const { profile, session, loading } = useAuthUser();
  const [enrolled, setEnrolled] = useState<EnrichedEnrollment[] | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    void (async () => {
      // Enrollments
      const { data: enr } = await supabase
        .from("enrollments")
        .select("id,course_id,status,enrolled_at,completed_at,course:courses(id,title,slug,cover_url)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      const enrollments = (enr ?? []) as Enrollment[];

      const enriched: EnrichedEnrollment[] = await Promise.all(
        enrollments.map(async (e) => {
          const [{ count: total }, doneRes, lastRes] = await Promise.all([
            supabase
              .from("course_lessons")
              .select("id, course_modules!inner(course_id)", { count: "exact", head: true })
              .eq("course_modules.course_id", e.course_id),
            supabase
              .from("lesson_progress")
              .select("watched_seconds, completed_at")
              .eq("enrollment_id", e.id),
            supabase
              .from("lesson_progress")
              .select("lesson_id, last_watched_at")
              .eq("enrollment_id", e.id)
              .order("last_watched_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          const rows = (doneRes.data ?? []) as { watched_seconds: number; completed_at: string | null }[];
          const done = rows.filter((r) => r.completed_at).length;
          const totalSeconds = rows.reduce((sum, r) => sum + (r.watched_seconds ?? 0), 0);

          return {
            ...e,
            total: total ?? 0,
            done,
            progress: total && total > 0 ? Math.round((done / total) * 100) : 0,
            lastLessonId: (lastRes.data as any)?.lesson_id ?? null,
            lastWatchedAt: (lastRes.data as any)?.last_watched_at ?? null,
            totalSeconds,
          };
        }),
      );

      setEnrolled(enriched);
    })();

    // Recent notifications
    void supabase
      .from("notifications")
      .select("id,title,body,link,read,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setNotifs((data as Notif[]) ?? []));

    // Streak: distinct days with lesson_progress activity in the last 30 days
    void (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data } = await supabase
        .from("lesson_progress")
        .select("last_watched_at, enrollment:enrollments!inner(user_id)")
        .eq("enrollment.user_id", userId)
        .gte("last_watched_at", since.toISOString());
      const days = new Set(
        ((data ?? []) as any[]).map((r) => new Date(r.last_watched_at).toISOString().slice(0, 10)),
      );
      // Count consecutive from today backwards
      let streak = 0;
      const cursor = new Date();
      while (days.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreakDays(streak);
    })();
  }, [session]);

  if (loading || !session) {
    return <div className="glass h-40 animate-pulse rounded-2xl" />;
  }

  const continueLearning = (enrolled ?? [])
    .filter((e) => e.lastLessonId && e.progress < 100 && e.course)
    .sort((a, b) => (b.lastWatchedAt ?? "").localeCompare(a.lastWatchedAt ?? ""))
    .slice(0, 3);

  const completed = (enrolled ?? []).filter((e) => e.status === "completed" || e.progress === 100).length;
  const totalLessonsDone = (enrolled ?? []).reduce((s, e) => s + e.done, 0);
  const totalHours = Math.round(((enrolled ?? []).reduce((s, e) => s + e.totalSeconds, 0) / 3600) * 10) / 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Hi {profile?.display_name ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value={enrolled?.length ?? "…"} icon={BookOpen} hint="Courses" />
        <StatCard label="Lessons done" value={totalLessonsDone} icon={GraduationCap} />
        <StatCard label="Hours watched" value={`${totalHours}h`} icon={Clock} />
        <StatCard label="Streak" value={`${streakDays}d`} icon={Flame} hint="Consecutive learning days" />
      </div>

      {/* Continue Learning */}
      {continueLearning.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Continue learning</h2>
            <Link to="/student/courses" className="text-xs text-primary-glow hover:underline">
              All courses →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {continueLearning.map((e) => (
              <Link
                key={e.id}
                to="/student/courses/$slug/$lessonId"
                params={{ slug: e.course!.slug, lessonId: e.lastLessonId! }}
                className="group glass overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-background">
                  {e.course!.cover_url ? (
                    <img src={e.course!.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <BookOpen className="h-10 w-10 text-primary-glow/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                      {e.progress}% done
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-background shadow-glow transition group-hover:scale-110">
                      <PlayCircle className="h-5 w-5" />
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="line-clamp-1 font-semibold group-hover:text-primary-glow">{e.course!.title}</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-primary" style={{ width: `${e.progress}%` }} />
                  </div>
                  {e.lastWatchedAt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last watched {formatDistanceToNow(new Date(e.lastWatchedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All courses + notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">My courses</h2>
            <Link to="/student/courses" className="text-xs text-primary-glow hover:underline">
              Browse catalog →
            </Link>
          </div>
          {enrolled === null ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-white/5" />
          ) : enrolled.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary-glow/60" />
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't enrolled in any courses yet.
              </p>
              <Link
                to="/courses"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-background shadow-glow"
              >
                Explore courses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {enrolled.map((e) => (
                <Link
                  key={e.id}
                  to="/student/courses/$slug"
                  params={{ slug: e.course?.slug ?? "" }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-background/40 p-3 transition hover:border-primary/40"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-background">
                    {e.course?.cover_url ? (
                      <img src={e.course.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <BookOpen className="h-5 w-5 text-primary-glow/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-semibold group-hover:text-primary-glow">{e.course?.title}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full bg-gradient-primary" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {e.done}/{e.total} · {e.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent activity</h2>
            <Link to="/student/notifications" className="text-xs text-primary-glow hover:underline">
              All →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-white/5">
            {notifs.length === 0 ? (
              <li className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                <Bell className="mb-2 h-7 w-7 opacity-40" />
                No notifications yet.
              </li>
            ) : (
              notifs.map((n) => {
                const inner = (
                  <div className="flex items-start gap-2 py-3">
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-glow" />}
                    <div className={`min-w-0 flex-1 ${n.read ? "opacity-60" : ""}`}>
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.body}</div>}
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
                return n.link ? (
                  <li key={n.id}>
                    <Link to={n.link} className="block hover:bg-white/[0.03]">{inner}</Link>
                  </li>
                ) : (
                  <li key={n.id}>{inner}</li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
